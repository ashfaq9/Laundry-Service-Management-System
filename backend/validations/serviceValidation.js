const { checkSchema } = require('express-validator');

const serviceValidation = checkSchema({
    name: {
        in: ['body'],
        exists: {
            errorMessage: 'Service name is required'
        },
        notEmpty: {
            errorMessage: 'Service name cannot be empty'
        },
        trim: true
    },
    description: {
        in: ['body'],
        exists: {
            errorMessage: 'Service description is required'
        },
        notEmpty: {
            errorMessage: 'Service description cannot be empty'
        },
        trim: true
    },
    prices: {
        in: ['body'],
        custom: {
            options: (value) => {
                // Allow prices to be either an array or a JSON string
                if (typeof value === 'string') {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        throw new Error('Prices must be a valid JSON array');
                    }
                }
                if (!Array.isArray(value)) {
                    throw new Error('Prices must be an array');
                }
                if (value.length === 0) {
                    throw new Error('Prices array cannot be empty');
                }
                for (const price of value) {
                    if (!price.item || !price.price) {
                        throw new Error('Each price must have an item and a price');
                    }
                    if (typeof price.price !== 'number' || price.price <= 0) {
                        throw new Error('Price must be a positive number');
                    }
                }
                return true;
            }
        }
    }
});

module.exports = serviceValidation;
