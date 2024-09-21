const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const paymentSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    stripePaymentIntentId: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Payment = model('Payment', paymentSchema);

module.exports = Payment;
