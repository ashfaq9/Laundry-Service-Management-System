const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ServiceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prices: [
        {
            item: { type: String, required: true },
            price: { type: Number, required: true }
        }
    ],
    image: { type: String, required: true }//
}, { timestamps: true });

const Service = model('Service', ServiceSchema);

module.exports = Service;
