const { checkSchema } = require('express-validator');

const feedbackValidation = checkSchema({
    order: {
        in: ['body'],
        exists: {
            errorMessage: 'Order ID is required'
        },
        notEmpty: {
            errorMessage: 'Order ID cannot be empty'
        }
    },
    rating: {
        in: ['body'],
        exists: {
            errorMessage: 'Rating is required'
        },
        isInt: {
            options: { min: 1, max: 5 },
            errorMessage: 'Rating must be between 1 and 5'
        }
    },
    comment: {
        in: ['body'],
        exists: {
            errorMessage: 'Comment is required'
        },
        notEmpty: {
            errorMessage: 'Comment cannot be empty'
        }
        // isLength: {
        //     options: { min: 10 },
        //     errorMessage: 'Comment must be at least 10 characters long'
        // }
    }
});

module.exports = feedbackValidation;
