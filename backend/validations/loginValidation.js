const { check, validationResult } = require('express-validator');

const loginValidation = [
  check('email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = loginValidation;
