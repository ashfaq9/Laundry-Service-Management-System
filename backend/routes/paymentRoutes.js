const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authenticateUser = require('../middlewares/authMiddleware');
const paymentValidation = require('../validations/paymentValidation');

router.post('/create-payment-intent', authenticateUser, paymentValidation, PaymentController.createPaymentIntent);
router.post('/confirm-payment', authenticateUser, PaymentController.confirmPayment);
router.post('/retry-payment', authenticateUser, PaymentController.retryPayment);
router.post('/cancel-payment', authenticateUser, PaymentController.cancelPayment);
// router.get('/completion/:id', authenticateUser, PaymentController.getPaymentCompletionDetails);
// router.get('/pending-order', authenticateUser, PaymentController.checkForPendingOrders);




module.exports = router;
