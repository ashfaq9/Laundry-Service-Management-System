const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const { forgetPasswordEmail, welcomeEmail } = require('../utils/nodeMailer');
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const fs = require('fs'); // For file deletion if needed
const path = require('path');

const userControl = {};

// Register User
userControl.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone, address, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ errors: [{ param: 'email', msg: 'Email is already taken' }] });
    }

    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(password, salt);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
    });
    await user.save();
    await welcomeEmail(user.email);

    return res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: `Bearer ${generateToken(user._id)}`,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// In userController.js or a separate file
// userControl.checkEmail = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ available: false });
//     } else {
//       return res.status(200).json({ available: true });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };


// Login User
userControl.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcryptjs.compare(password, user.password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: `Bearer ${generateToken(user._id)}`,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Account Details
userControl.getAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage ? `/uploads/${user.profileImage}` : null,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile
userControl.updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(req.body.password, salt);
      }
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.file) {
        console.log('Uploaded file:', req.file);
        user.profileImage = req.file.filename;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage ? `/uploads/${updatedUser.profileImage}` : null,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forget Password
userControl.forgetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('Email not found');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await forgetPasswordEmail(user.email, token);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
userControl.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ errors: [{ msg: 'Passwords do not match' }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      throw new Error('Invalid token or user does not exist');
    }

    const salt = await bcryptjs.genSalt();
    user.password = await bcryptjs.hash(password, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users

userControl.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName email phone address profileImage');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

userControl.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};


//remove image 

userControl.removeProfileImage = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.profileImage) {
      // Optionally delete the file from the server
      const imagePath = path.join(__dirname, '../uploads', user.profileImage);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting profile image:', err);
      });

      user.profileImage = null;
      await user.save();
    }

    res.status(200).json({ message: 'Profile image removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = userControl;