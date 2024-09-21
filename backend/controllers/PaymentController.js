const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/PaymentModel');
const Order = require('../models/OrderModel');
const Transaction = require('../models/TransactionModel');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/nodeMailer');
const Cart =require('../models/cartModel')

const PaymentControl = {};

// Create Payment Intent
PaymentControl.createPaymentIntent = async (req, res) => {
  console.log('Received request to create payment intent');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId, currency = 'INR' } = req.body;

  try {
    console.log('Order ID:', orderId);
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const amount = order.totalAmount;
    console.log('Amount:', amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types: ['card'],
      metadata: { orderId: order._id.toString() },
    });

    console.log('Payment Intent:', paymentIntent);

    const payment = new Payment({
      orderId: order._id,
      amount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'Pending',
    });

    await payment.save();

    res.status(201).json({ 
      paymentIntentId: paymentIntent.id, 
      clientSecret: paymentIntent.client_secret, 
      payment 
    });

    console.log('Payment Intent created successfully');
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Create Payment Intent Error:', error.message);
  }
};

// Confirm Payment
PaymentControl.confirmPayment = async (req, res) => {
  const { paymentIntentId, paymentMethodId, orderId } = req.body;

  try {
    console.log('Received confirmation request');
    console.log('Payment Intent ID:', paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(400).json({ error: 'PaymentIntent not found' });
    }

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId, orderId });
    if (!payment || payment.paymentStatus !== 'Pending') {
      return res.status(404).json({ error: 'Payment not found or already processed' });
  }


    console.log('Payment Found:', payment);

    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      { payment_method: paymentMethodId }
    );

    console.log('Confirmed Payment Intent:', confirmedPaymentIntent);

    if (confirmedPaymentIntent.status === 'succeeded') {
      payment.paymentStatus = 'Completed';
      await payment.save();

      const order = await Order.findById(payment.orderId).populate('user');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      order.status = 'Ordered';
      await order.save();

      const transaction = new Transaction({
        user: order.user,
        order: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: 'Completed',
        paymentMethod: 'Stripe',
        stripePaymentIntentId: paymentIntentId,
        transactionDate: new Date(),
      });
      await transaction.save();
      console.log(transaction);

      console.log('Payment and Order updated successfully');

      if (order.user && order.user.email) {
        console.log('Sending email to:', order.user.email);
        await sendEmail({
          from: process.env.EMAIL,
          to: order.user.email,
          subject: 'Order Confirmation',
          text: `Your order has been placed successfully. Order ID: ${order._id}`,
        });
      } else {
        console.error('No valid email address found for the user');
      }

      // Clear the cart after order status is updated to Paid
      await Cart.findOneAndUpdate({ userId: order.user._id }, { items: [] });

      res.status(200).json({ success: true, transaction, orderStatus: 'Ordered' });
    } else {
      console.log('Payment not confirmed, status:', confirmedPaymentIntent.status);
      res.status(400).json({ error: 'Payment not confirmed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Confirm Payment Error:', error.message);
  }
};




// Retry Payment
PaymentControl.retryPayment = async (req, res) => {
  const { paymentIntentId, paymentMethodId, orderId } = req.body;

  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId, orderId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    if (paymentIntent.status === 'succeeded') {
      payment.paymentStatus = 'Completed';
      await payment.save();

      const order = await Order.findById(payment.orderId).populate('user');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      order.status = 'Confirmed';
      await order.save();

      const transaction = new Transaction({
        user: order.user,
        order: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: 'Completed',
        paymentMethod: 'Stripe',
        stripePaymentIntentId: paymentIntentId,
        transactionDate: new Date(),
      });
      await transaction.save();

      if (order.user && order.user.email) {
        await sendEmail({
          from: process.env.EMAIL,
          to: order.user.email,
          subject: 'Order Confirmation',
          text: `Your order has been placed successfully. Order ID: ${order._id}`,
        });
      }

      await Cart.findOneAndUpdate({ userId: order.user._id }, { items: [] });

      res.status(200).json({ success: true, transaction, orderStatus: 'Ordered' });
    } else {
      res.status(400).json({ error: 'Payment retry failed' });
    }
  } catch (error) {
    console.error('Retry Payment Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Cancel Payment
PaymentControl.cancelPayment = async (req, res) => {
  const { paymentIntentId, orderId } = req.body;

  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId, orderId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await stripe.paymentIntents.cancel(paymentIntentId);

    payment.paymentStatus = 'Failed';
    await payment.save();

    const order = await Order.findById(payment.orderId).populate('user');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = 'Cancelled';
    await order.save();

    if (order.user && order.user.email) {
      await sendEmail({
        from: process.env.EMAIL,
        to: order.user.email,
        subject: 'Order Cancellation',
        text: `Your order has been cancelled. Order ID: ${order._id}`,
      });
    }

    res.status(200).json({ success: true, orderStatus: 'Cancelled' });
  } catch (error) {
    console.error('Cancel Payment Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Payment Completion Details
// PaymentControl.getPaymentCompletionDetails = async (req, res) => {
//   try {
//     const transactionId = req.params.id;
//     const transaction = await Transaction.findById(transactionId).populate('user order');

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     res.status(200).json(transaction);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//     console.error('Get Payment Completion Details Error:', error.message);
//   }
// };

// cron.schedule('* * * * *', async () => {
//   try {
//       const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

//       // Find and delete orders with a "Pending" status older than 1 hour
//       const result = await Order.deleteMany({
//           orderStatus: 'Pending',
//           createdAt: { $lt: oneHourAgo }
//       });

//       console.log(`Deleted ${result.deletedCount} pending orders older than 1 hour.`);
//   } catch (error) {
//       console.error('Error deleting old pending orders:', error.message);
//   }
// });




module.exports = PaymentControl;
