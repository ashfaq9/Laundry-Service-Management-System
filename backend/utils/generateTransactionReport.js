// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// const generateTransactionReport = async (transaction) => {
//     return new Promise((resolve, reject) => {
//         try {
//             if (!transaction || !transaction._id) {
//                 throw new Error('Transaction data is incomplete');
//             }

//             if (!transaction.user || !transaction.user._id) {
//                 throw new Error('User data is incomplete');
//             }

//             if (!transaction.order || !transaction.order._id) {
//                 throw new Error('Order data is incomplete');
//             }

//             const reportsDir = path.join(__dirname, '../reports');
//             if (!fs.existsSync(reportsDir)) {
//                 fs.mkdirSync(reportsDir);
//             }
//             const filePath = path.join(reportsDir, `transaction-${transaction._id}.pdf`);
//             console.log(`Generating PDF at ${filePath}`);

//             const doc = new PDFDocument();
//             doc.pipe(fs.createWriteStream(filePath));

//             doc.fontSize(25).text('Transaction Report', { align: 'center' });

//             doc.moveDown();
//             doc.fontSize(18).text(`Transaction ID: ${transaction._id}`);
//             doc.fontSize(18).text(`User: ${transaction.user.firstName} ${transaction.user.lastName}`);
//             doc.fontSize(18).text(`Email: ${transaction.user.email}`);
//             doc.fontSize(18).text(`Order ID: ${transaction.order._id}`);
//             doc.fontSize(18).text(`Amount: ${transaction.amount} ${transaction.currency}`);
//             doc.fontSize(18).text(`Status: ${transaction.status}`);
//             doc.fontSize(18).text(`Payment Method: ${transaction.paymentMethod}`);
//             doc.fontSize(18).text(`Transaction Date: ${transaction.transactionDate.toLocaleDateString()}`);
//             doc.end();

//             doc.on('finish', () => {
//                 console.log(`PDF generated at ${filePath}`);
//                 resolve(filePath);
//             });

//             doc.on('error', (err) => {
//                 console.error('PDF generation error:', err);
//                 reject(err);
//             });
//         } catch (err) {
//             console.error('Unexpected error during PDF generation:', err);
//             reject(err);
//         }
//     });
// };

// module.exports = generateTransactionReport;
