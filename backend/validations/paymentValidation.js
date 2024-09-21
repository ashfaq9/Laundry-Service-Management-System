const { checkSchema } = require('express-validator');

const paymentValidation = checkSchema({
    // orderId: {
    //     in: ['body'],
    //     exists: {
    //         errorMessage: 'Order ID is required'
    //     },
    //     notEmpty: {
    //         errorMessage: 'Order ID cannot be empty'
    //     }
    // }
});

module.exports = paymentValidation;
