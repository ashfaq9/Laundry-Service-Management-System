const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReport = async (data, reportType) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }
    const filePath = path.join(reportsDir, `${reportType.toLowerCase()}-report-${Date.now()}.pdf`);
    console.log(`Generating PDF at ${filePath}`);

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(25).text(`${reportType} Report`, { align: 'center' });

    doc.moveDown();

    data.forEach((item, index) => {
      const count = index + 1;
      const formattedItem = formatItem(item, reportType, count);
      doc.fontSize(18).text(`${reportType} ${count}`, { underline: true });
      doc.fontSize(18).text(formattedItem);
      doc.moveDown();
    });

    doc.end();

    writeStream.on('finish', () => {
      console.log(`PDF generated at ${filePath}`);
      resolve(filePath);
    });

    writeStream.on('error', (err) => {
      console.error('PDF generation error:', err);
      reject(err);
    });
  });
};

const formatItem = (item, reportType, count) => {
  if (reportType === 'Order') {
    return `
Order ID: ${item._id}
User: ${item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A'}
Total Amount: ${item.totalAmount}
Status: ${item.status}
Pickup Date: ${item.pickupDate}
Location: ${item.location}
Services: ${item.services.map(service => service.service ? `${service.service.name} (${service.items.map(item => `${item.item}: ${item.quantity}`).join(', ')})` : '').join(', ')}
        `;
  } else if (reportType === 'Transaction') {
    return `
Transaction ID: ${item._id}
User: ${item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A'}
Order ID: ${item.order ? item.order._id : 'N/A'}
Amount: ${item.amount}
Status: ${item.status}
Payment Method: ${item.paymentMethod}
Transaction Date: ${item.transactionDate.toLocaleDateString()}
        `;
  } else {
    return JSON.stringify(item, null, 2);
  }
};

module.exports = generateReport;
