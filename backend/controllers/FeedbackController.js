const Feedback = require('../models/FeedbackModel');
const Order = require('../models/OrderModel');
const { validationResult } = require('express-validator');

const FeedbackControl = {};

// Add feedback
FeedbackControl.addFeedback = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { order, rating, comment } = req.body;

    try {
        // Validate order
        const foundOrder = await Order.findById(order);
        if (!foundOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (foundOrder.status !== 'Delivered') {
            return res.status(400).json({ error: 'Feedback can only be added after the order is delivered' });
        }

        // Create and save feedback
        const feedback = new Feedback({
            user: req.user.id,
            order,
            rating,
            comment
        });

       

        await feedback.save();
        res.status(201).json(feedback);
    } catch (err) {
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        
        res.status(500).json({ error: err.message });
    }
};

// Get feedback for an order
FeedbackControl.getFeedbackByOrder = async (req, res) => {
    try {
        const feedback = await Feedback.find({ order: req.params.orderId }).populate('user', 'firstName');
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all feedback
FeedbackControl.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user', 'firstName').populate('order');
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update feedback
FeedbackControl.updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.status(200).json(feedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete feedback
FeedbackControl.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

FeedbackControl.addResponse =async (req,res) =>{
    const {feedbackId} =req.params
    const {comment} =req.body

    try{
        const feedback =await Feedback.findById(feedbackId)
        if(!feedback){
            return res.status(404).json({error:'Feedback not found'})
        }

        feedback.responses.push({
            user:req.user.id,
            comment
        })

        await feedback.save()
        res.status(200).json(feedback)
    } catch(err){
        res.status(500).json({error:err.message})
    }
}


FeedbackControl.deleteResponse = async (req,res) =>{
    const { feedbackId, responseId } = req.params;
    try {
        // Find the feedback by ID
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Filter out the response with the matching responseId
        feedback.responses = feedback.responses.filter(response => response._id.toString() !== responseId);

        // Save the updated feedback document
        await feedback.save();

        res.status(200).json({ message: 'Response deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = FeedbackControl;
