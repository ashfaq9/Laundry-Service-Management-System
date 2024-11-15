const axios = require('axios');
const geolib = require('geolib');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/nodeMailer');
const cron = require('node-cron');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Cart = require('../models/cartModel');

const allowedLocation = { latitude: 12.9715999, longitude: 77.594566 };
const maxDistance = 30000; // 30 km in meters

const OrderControl = {};

// Geocoding helper function
const geocodeAddress = async (address) => {
    try {
        let response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                q: address,
                key: process.env.MAP_API_KEY,
                limit: 1,
            },
        });

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            console.warn('Initial geocoding failed. Retrying with simplified address.');
            const simplifiedAddress = address.replace(/^\d+\/\d+,\s*\d+\w*,\s*/i, '');
            response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    q: simplifiedAddress,
                    key: process.env.MAP_API_KEY,
                    limit: 1,
                },
            });
        }

        if (response.data && response.data.results && response.data.results.length > 0) {
            const bestResult = response.data.results[0];
            return {
                formatted_address: bestResult.formatted,
                latitude: bestResult.geometry.lat,
                longitude: bestResult.geometry.lng,
                components: bestResult.components,
            };
        } else {
            throw new Error('No geocoding results found');
        }
    } catch (error) {
        console.error('Geocoding error:', error.message);
        throw new Error('Geocoding failed');
    }
};

// Validate location within serviceable area
const validateLocation = (latitude, longitude) => {
    const distance = geolib.getDistance({ latitude, longitude }, allowedLocation);
    return distance <= maxDistance;
};

// Create an order
OrderControl.createOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { user: userId, pickupDate, pickupTime, formatted_address, orderPersonName, phoneNumber } = req.body;
        const geocodeResponse = await geocodeAddress(formatted_address);

        if (!geocodeResponse || !geocodeResponse.latitude || !geocodeResponse.longitude) {
            throw new Error('Invalid geocoding response');
        }

        const { formatted_address: fullAddress, latitude: geocodedLat, longitude: geocodedLng, components } = geocodeResponse;
        if (!validateLocation(geocodedLat, geocodedLng)) {
            throw new Error('Service not available at this location');
        }

        const cart = await Cart.findOne({ userId }).populate('items.service');
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const services = cart.items.map(item => ({
            service: item.service._id,
            items: [{ item: item.item, quantity: item.quantity }],
        }));

        const totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        const order = new Order({
            user: userId,
            services,
            pickupDate,
            pickupTime,
            latitude: geocodedLat,
            longitude: geocodedLng,
            formatted_address: fullAddress,
            street: components.road || '',
            postalCode: components.postcode || '',
            city: components.city || '',
            country: components.country || '',
            totalAmount,
            orderPersonName,
            phoneNumber,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        });

        await order.save();
        console.log('Order created:', order);
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get all orders
OrderControl.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('services.service');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single order by ID
OrderControl.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user').populate('services.service');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order by ID (Admin)
OrderControl.updateOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await sendEmail({
            from: process.env.EMAIL,
            to: order.user.email,
            subject: 'Order Status Update',
            text: `Your order status has been updated to: ${status}. Order ID: ${order._id}`,
        });

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an order by ID
OrderControl.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get orders by user ID
OrderControl.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).populate('services.service');
        if (!orders.length) {
            return res.status(404).json({ error: 'No orders found for this user' });
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin update order status
OrderControl.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('user');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.orderStatus = status;
        await order.save();

        await sendEmail({
            from: process.env.EMAIL,
            to: order.user.email,
            subject: 'Order Status Update',
            text: `Your order status has been updated to: ${status}. Order ID: ${order._id}`,
        });

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cron job to delete pending orders older than 1 hour
cron.schedule('* * * * *', async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const result = await Order.deleteMany({ status: 'Pending', createdAt: { $lt: oneHourAgo } });
        if (result.deletedCount > 0) {
            console.log(`Deleted ${result.deletedCount} pending orders older than 1 hour.`);
        }
    } catch (error) {
        console.error('Error deleting old pending orders:', error.message);
    }
});

module.exports = OrderControl;
