const express = require('express');
const router = express.Router();
const AdminControl = require('../controllers/AdminController');
const authenticateUser = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authAdmin');
const { checkSchema } = require('express-validator');

router.get('/dashboard', authenticateUser, isAdmin, AdminControl.getDashboardData);
router.get('/order-report', authenticateUser, isAdmin, AdminControl.generateOrderReport);
router.get('/transaction-report', authenticateUser, isAdmin, AdminControl.generateTransactionReport);

module.exports = router;
