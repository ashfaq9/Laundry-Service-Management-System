const express = require('express');
// const { registerUser, removeProfileImage, login, getAccount, updateUserProfile, forgetPassword, resetPassword, getAllUsers,deleteUser} = require('../controllers/userController');
const authenticateUser = require('../middlewares/authMiddleware');
const { userRegisterValidation, userLoginValidation, userUpdateValidation, userForgetPasswordValidation, userResetPasswordValidation } = require('../validations/userValidation');
const { checkSchema } = require('express-validator');
const { isAdmin } = require('../middlewares/authAdmin');
const upload = require('../utils/multer');
const userControl = require('../controllers/userController');

const router = express.Router();

router.post('/register', checkSchema(userRegisterValidation), userControl.registerUser);
// router.post('/check-email', userControl.checkEmail);
router.post('/login', checkSchema(userLoginValidation), userControl.login);
router.get('/account', authenticateUser, userControl.getAccount);
router.put('/profile', authenticateUser, upload.single('profileImage'), checkSchema(userUpdateValidation), userControl.updateUserProfile);
router.post('/forget-password', checkSchema(userForgetPasswordValidation), userControl.forgetPassword);
router.post('/reset-password/:token', checkSchema(userResetPasswordValidation), userControl.resetPassword);
router.delete('/profile-image', authenticateUser, userControl.removeProfileImage);

router.get('/admin/users', authenticateUser, isAdmin, userControl.getAllUsers);
router.delete('/delete/users/:userId', authenticateUser, isAdmin, userControl.deleteUser);

module.exports = router;
