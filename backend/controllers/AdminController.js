const Order = require('../models/OrderModel');
const Transaction = require('../models/TransactionModel');
const generateReport = require('../utils/generateReport');
const moment = require('moment');

const AdminControl = {};

AdminControl.getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;
    let start = moment().startOf('year');
    let end = moment().endOf('year');

    if (filter === 'monthly') {

      
      start = moment().startOf('month');
      end = moment().endOf('month');
    } else if (filter === 'weekly') {
      start = moment().startOf('week');
      end = moment().endOf('week');
    } else if (filter === 'daily') {
      start = moment().startOf('day');
      end = moment().endOf('day');
    } else if (filter === 'custom' && startDate && endDate) {
      start = moment(startDate, 'YYYY-MM-DD');
      end = moment(endDate, 'YYYY-MM-DD');

      if (!start.isValid() || !end.isValid()) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    // Fetch orders and transactions based on the date range
    const orders = await Order.find({
      createdAt: {
        $gte: start.toDate(),
        $lte: end.toDate(),
      },
    }).populate('user').populate('services.service');

    const transactions = await Transaction.find({
      transactionDate: {
        $gte: start.toDate(),
        $lte: end.toDate(),
      },
    }).populate('user').populate('order');

    // Aggregate data for the dashboard
    const totalRevenue = transactions.reduce((acc, transaction) => acc + (transaction.amount || 0), 0);

    const orderStatusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const topServices = orders.reduce((acc, order) => {
      order.services.forEach(service => {
        if (service?.service?.name) {
          acc[service.service.name] = (acc[service.service.name] || 0) + 1;
        }
      });
      return acc;
    }, {});

    const topUsers = transactions.reduce((acc, transaction) => {
      if (transaction.user?.email) {
        acc[transaction.user.email] = (acc[transaction.user.email] || 0) + (transaction.amount || 0);
      }
      return acc;
    }, {});

    const dashboardData = {
      totalOrders: orders.length,
      totalRevenue,
      orderStatusBreakdown,
      topServices: Object.entries(topServices).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topUsers: Object.entries(topUsers).sort((a, b) => b[1] - a[1]).slice(0, 5),
      orders,
      transactions,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

  


  AdminControl.generateOrderReport = async (req, res) => {
    try {
        const { startDate, endDate, filter } = req.query;
        let start = moment().startOf('year');
        let end = moment().endOf('year');

        if (filter === 'monthly') {
            start = moment().startOf('month');
            end = moment().endOf('month');
        } else if (filter === 'weekly') {
            start = moment().startOf('week');
            end = moment().endOf('week');
        } else if (filter === 'custom' && startDate && endDate) {
            start = moment(startDate);
            end = moment(endDate);

            if (!start.isValid() || !end.isValid()) {
                return res.status(400).json({ error: 'Invalid date format' });
            }
        }

        const orders = await Order.find({
            createdAt: { $gte: start.toDate(), $lte: end.toDate() },
        }).populate('user services.service');

        const reportPath = await generateReport(orders, 'Order');

        // Set header and send the file
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(reportPath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ error: 'Error sending the order report' });
            }
        });
    } catch (error) {
        console.error('Error generating order report:', error);
        res.status(500).json({ error: 'Error generating order report' });
    }
};

  
  AdminControl.generateTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;
    let start = moment().startOf('year');
    let end = moment().endOf('year');

    if (filter === 'monthly') {
      start = moment().startOf('month');
      end = moment().endOf('month');
    } else if (filter === 'weekly') {
      start = moment().startOf('week');
      end = moment().endOf('week');
    } else if (filter === 'custom' && startDate && endDate) {
      start = moment(startDate);
      end = moment(endDate);

      if (!start.isValid() || !end.isValid()) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    const transactions = await Transaction.find({
      transactionDate: { $gte: start.toDate(), $lte: end.toDate() },
    }).populate('user order');

    const reportPath = await generateReport(transactions, 'Transaction');

    // Set header for file type and send the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transaction-report-${Date.now()}.pdf"`);
    res.sendFile(reportPath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Error sending the transaction report' });
      }
    });
  } catch (error) {
    console.error('Error generating transaction report:', error);
    res.status(500).json({ error: 'Error generating transaction report' });
  }
};


module.exports = AdminControl;
