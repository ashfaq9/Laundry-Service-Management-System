const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const authenticateUser = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authAdmin');
const orderValidation = require('../validations/orderValidation');
const { checkSchema } = require('express-validator');

router.post('/', authenticateUser, orderValidation, orderController.createOrder);
router.get('/', authenticateUser, orderController.getAllOrders);
// router.get('/status', authenticateUser, isAdmin, orderController.getOrdersByStatus);
router.get('/:id', authenticateUser, orderController.getOrderById);
router.put('/:id', authenticateUser, isAdmin, orderValidation, orderController.updateOrder);
router.delete('/:id', authenticateUser, orderController.deleteOrder);
router.get('/user/:userId', authenticateUser, orderController.getOrdersByUser);
router.put('/status/:id', authenticateUser, isAdmin, orderController.updateOrderStatus);




module.exports = router;
