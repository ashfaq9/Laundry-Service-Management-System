const User = require('../models/UserModel');

const userRegisterValidation = {
    firstName: {
        in: ['body'],
        exists: {
            errorMessage: "First name is required"
        },
        notEmpty: {
            errorMessage: "First name cannot be empty"
        },
        trim: true
    },
    lastName: {
        in: ['body'],
        exists: {
            errorMessage: "Last name is required"
        },
        notEmpty: {
            errorMessage: "Last name cannot be empty"
        },
        trim: true
    },
    email: {
        in: ['body'],
        exists: {
            errorMessage: "Email is required"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Email should be in a valid format"
        },
        custom: {
            options: async (value) => {
                const user = await User.findOne({ email: value.toLowerCase() });
                if (user) {
                    throw new Error('Email already taken');
                }
            }
        },
        trim: true
    },
    password: {
        in: ['body'],
        exists: {
            errorMessage: "Password is required"
        },
        notEmpty: {
            errorMessage: "Password cannot be empty"
        },
        isLength: {
            options: {
                min: 8,
                max: 128
            },
            errorMessage: "Password should be between 10-128 characters"
        },
        trim: true
    },
    phone: {
        in: ['body'],
        exists: {
            errorMessage: "Phone number required"
        },
        notEmpty: {
            errorMessage: "number cannot be empty"
        },
        trim: true
    },
    address: {
        in: ['body'],
        exists: {
            errorMessage: "address is required"
        },
        notEmpty: {
            errorMessage: "address cannot be empty"
        },
        trim: true
    }
};

const userLoginValidation = {
    email: {
        in: ['body'],
        exists: {
            errorMessage: "Email is required"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Email should be in a valid format"
        },
        trim: true
    },
    password: {
        in: ['body'],
        exists: {
            errorMessage: "Password is required"
        },
        notEmpty: {
            errorMessage: "Password cannot be empty"
        },
        isLength: {
            options: {
                min: 6,
                max: 128
            },
            errorMessage: "Password should be between 6-128 characters"
        },
        trim: true
    }
};

const userUpdateValidation = {
    firstName: {
        in: ['body'],
        exists: {
            errorMessage: 'First Name is required'
        },
        notEmpty: {
            errorMessage: 'First Name cannot be empty'
        },
        trim: true
    },
    lastName: {
        in: ['body'],
        exists: {
            errorMessage: 'Last Name is required'
        },
        notEmpty: {
            errorMessage: 'Last Name cannot be empty'
        },
        trim: true
    },
    email: {
        in: ['body'],
        exists: {
            errorMessage: 'Email is required'
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be in a valid format'
        },
        trim: true,
        normalizeEmail: true
    },
    phone: {
        in: ['body'],
        optional: true,
        trim: true
    },
    address: {
        in: ['body'],
        optional: true,
        trim: true
    }
};
const userForgetPasswordValidation = {
    email: {
        in: ['body'],
        exists: {
            errorMessage: 'Email is required'
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be in a valid format'
        },
        trim: true
    }
};

const userResetPasswordValidation = {
    password: {
      in: ['body'],
      exists: {
        errorMessage: 'Password is required'
      },
      notEmpty: {
        errorMessage: 'Password cannot be empty'
      },
      isLength: {
        options: { min: 6, max: 128 },
        errorMessage: 'Password should be between 6-128 characters'
      },
      trim: true
    },
    confirmPassword: {
      in: ['body'],
      exists: {
        errorMessage: 'Confirm Password is required'
      },
      notEmpty: {
        errorMessage: 'Confirm Password cannot be empty'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords do not match');
          }
          return true;
        }
      },
      trim: true
    }
  };
  

module.exports = {
    userRegisterValidation,
    userLoginValidation,
    userUpdateValidation,
    userForgetPasswordValidation,
    userResetPasswordValidation
};