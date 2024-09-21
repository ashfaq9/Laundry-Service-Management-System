const Cart = require('../models/cartModel');
const { validationResult } = require('express-validator');
const mongoose =require('mongoose')

const cartController = {};

// Add item to cart
cartController.addToCart = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { userId, service, item, price, quantity } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItem = cart.items.find(i => i.item === item && i.service.toString() === service);
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = price; // Update price if needed
        } else {
            cart.items.push({ service, item, price, quantity });
        }

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update item quantity
cartController.updateQuantity = async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.find(i => i._id.toString() === itemId);
        if (item) {
            item.quantity = quantity;
            await cart.save();
        } else {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get user cart
cartController.getCart = async (req, res) => {
    const { userId } = req.params;

    // Log the userId to see if it's defined
    console.log('User ID:', userId);

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    try {
        const cart = await Cart.findOne({ userId }).populate('items.service', 'name');
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Remove item from cart
cartController.removeFromCart = async (req, res) => {
    const { userId, itemId } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Clear user cart
cartController.clearCart = async (req, res) => {
    const { userId } = req.params;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({ success: true, message: 'Cart cleared', cart });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = cartController;
