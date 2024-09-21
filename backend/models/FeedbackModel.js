const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const feedbackSchema = new Schema({
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
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    responses:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            comment:{
                type:String,
                required:true
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ]
}, { timestamps: true });

const Feedback = model('Feedback', feedbackSchema);

module.exports = Feedback;
