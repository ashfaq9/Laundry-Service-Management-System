const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Stripe', 'PayPal', 'pm_card_visa', 'card'],
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    stripePaymentIntentId: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: 'INR',
        required: true
    }
}, { timestamps: true });

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction;
