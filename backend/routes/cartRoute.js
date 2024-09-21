const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/CartController');

const router = express.Router();

router.post(
    '/add',
    [
        body('userId').not().isEmpty().withMessage('User ID is required'),
        body('item').not().isEmpty().withMessage('Item is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be greater than 0'),
        body('service')
        .notEmpty().withMessage('Service ID is required')
        .isMongoId().withMessage('Invalid Service ID'),
    ],
    cartController.addToCart
);

router.put(
    '/update-quantity',
    [
        body('userId').not().isEmpty().withMessage('User ID is required'),
        body('itemId').not().isEmpty().withMessage('Item ID is required'),
        body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    ],
    cartController.updateQuantity
);

router.get('/:userId', cartController.getCart);

router.delete('/remove', [
    body('userId').not().isEmpty().withMessage('User ID is required'),
    body('itemId').not().isEmpty().withMessage('Item ID is required')
], cartController.removeFromCart);

router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;
