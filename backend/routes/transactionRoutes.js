const express = require('express');
const router = express.Router();
const TransactionControl = require('../controllers/TransactionController');
const authenticateUser = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authAdmin');
const { checkSchema } = require('express-validator');

router.get('/order/:orderId', authenticateUser, TransactionControl.getTransactionByOrder);
router.get('/user', authenticateUser, TransactionControl.getUserTransactions);
router.get('/admin', authenticateUser, isAdmin, TransactionControl.getAllTransactions);
router.delete('/:id', authenticateUser, isAdmin, TransactionControl.deleteTransaction); 
// router.get('/send-report/:transactionId', authenticateUser, TransactionControl.sendTransactionReport);

module.exports = router;
