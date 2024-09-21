const Transaction = require('../models/TransactionModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
// const generateTransactionReport = require('../utils/generateTransactionReport');
// const { sendEmail } = require('../utils/nodeMailer');
const mongoose = require('mongoose');


const TransactionControl = {};

// Generate Transaction History and Include Payment Completion Link
// TransactionControl.generateTransactionHistory = async (req, res) => {
//     try {
//         const { userId, orderId, paymentMethod, status, amount, stripePaymentIntentId, currency } = req.body;

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         const transaction = new Transaction({
//             user: userId,
//             order: orderId,
//             paymentMethod,
//             status,
//             amount,
//             transactionDate: new Date(),
//             stripePaymentIntentId,
//             currency
//         });

//         await transaction.save();

//         const paymentCompletionLink = `${process.env.CLIENT_URL}/payment-completion/${transaction._id}`;

//         res.status(201).json({
//             message: 'Transaction recorded and invoice generated',
//             transaction,
//             invoice: {
//                 user: `${user.firstName} ${user.lastName}`,
//                 order: order._id,
//                 paymentMethod: transaction.paymentMethod,
//                 status: transaction.status,
//                 amount: transaction.amount,
//                 date: transaction.transactionDate,
//                 paymentCompletionLink
//             }
//         });
//     } catch (error) {
//         console.error('Error in generateTransactionHistory:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// Get transaction by order 
TransactionControl.getTransactionByOrder = async (req, res) => {
    try {
        const transactions = await Transaction.find({ order: req.params.orderId }).populate('user', 'firstName lastName email').populate('order');
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error in getTransactionByOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all transactions for a user
// Get all transactions for a user
TransactionControl.getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { searchId, filter, specificDate } = req.query;

        let query = { user: userId };

        if (searchId && mongoose.Types.ObjectId.isValid(searchId)) {
            query._id = searchId;
        }

        switch (filter) {
            case 'specificDate':
                if (specificDate) {
                    const startOfDay = new Date(specificDate).setHours(0, 0, 0, 0);
                    const endOfDay = new Date(specificDate).setHours(23, 59, 59, 999);
                    query.transactionDate = { $gte: startOfDay, $lt: endOfDay };
                }
                break;
            case 'daily':
                query.transactionDate = { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) };
                break;
            case 'weekly':
                const startOfWeek = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
                query.transactionDate = { $gte: startOfWeek, $lt: new Date(startOfWeek).setDate(startOfWeek.getDate() + 6) };
                break;
            case 'monthly':
                query.transactionDate = {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                };
                break;
            case 'yearly':
                query.transactionDate = {
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lt: new Date(new Date().getFullYear(), 12, 31)
                };
                break;
            default:
                break;
        }

        const transactions = await Transaction.find(query)
            .populate('order')
            .populate('user', 'firstName lastName email')
            .sort({ transactionDate: -1 });

        if (!transactions.length) {
            return res.status(404).json({ error: 'No transactions found' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error in getUserTransactions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Get all transactions for admin
TransactionControl.getAllTransactions =async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = {};

        if (startDate && endDate) {
            query.createdAt = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            };
        }

        const transactions = await Transaction.find(query)
            .populate('user', 'firstName lastName')
            .populate({
                path: 'order',
                populate: [
                    {
                        path: 'services.service', // Assuming service is a reference to a Service model
                        select: 'name' // Populate the service name field
                    }
                ]
            });

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error in getAllTransactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// Delete transaction admin
TransactionControl.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTransaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Send transaction report
// TransactionControl.sendTransactionReport = async (req, res) => {
//     try {
//         const { transactionId } = req.params;
//         console.log(`Fetching transaction with ID: ${transactionId}`);

//         // Fetch the transaction and populate user and order details
//         const transaction = await Transaction.findById(transactionId).populate({
//             path: 'user',
//             select: 'firstName lastName email'
//         })
//         .populate({
//             path: 'order',
//             select: '_id' // Adjust based on needed fields
//         });
//         if (!transaction) {
//             console.log('Transaction not found');
//             return res.status(404).json({ error: 'Transaction not found' });
//         }

//         console.log(`Generating report for transaction ID: ${transactionId}`);
//         const reportPath = await generateTransactionReport(transaction);
//         console.log(`Report generated at: ${reportPath}`);

//         // Email configuration
//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: transaction.user.email,
//             subject: 'Your Transaction Report',
//             text: 'Please find attached your transaction report.',
//             attachments: [
//                 {
//                     filename: `transaction-${transaction._id}.pdf`,
//                     path: reportPath,
//                 },
//             ],
//         };

//         console.log(`Sending email to: ${transaction.user.email}`);
//         await sendEmail(mailOptions);
//         console.log('Email sent successfully');
//         res.status(200).json({ message: 'Transaction report sent successfully' });

//     } catch (error) {
//         console.error('Error in sendTransactionReport:', error);
//         res.status(500).json({ error: 'Error generating transaction report' });
//     }
// };



// // Generate report for all transactions
// TransactionControl.generateReport = async (req, res) => {
//     try {
//         const transactions = await Transaction.find().populate('user order');

//         if (!transactions.length) {
//             return res.status(404).json({ error: 'No transactions found' });
//         }

//         const reportPath = await generateTransactionReport(transactions);

//         res.status(200).json({
//             message: 'Report generated successfully',
//             reportPath
//         });
//     } catch (error) {
//         console.error('Error in generateReport:', error);
//         res.status(500).json({ error: 'Error generating report' });
//     }
// };

module.exports = TransactionControl;
