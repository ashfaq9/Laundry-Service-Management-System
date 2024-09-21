const mongoose = require('mongoose');
const { Schema } = mongoose; // Import Schema from Mongoose

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            service: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Service',
                required: true, // This ensures every item has a service reference
            },
            item: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
});

module.exports = mongoose.model('Cart', CartSchema);
