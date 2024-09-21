const express = require('express');
const router = express.Router();
const serviceControl = require('../controllers/serviceController');
const { isAdmin } = require('../middlewares/authAdmin');
const authenticateUser = require('../middlewares/authMiddleware');
const serviceValidation = require('../validations/serviceValidation');
const upload = require('../utils/multer');
const { checkSchema } = require('express-validator');

router.post('/', authenticateUser, isAdmin, upload.single('image'), serviceValidation, serviceControl.createService);
router.get('/', serviceControl.getAllServices);
router.get('/:id', serviceControl.getServiceById);
router.put('/:id', authenticateUser, isAdmin, upload.single('image'), serviceValidation, serviceControl.updateService);
router.delete('/:id', authenticateUser, isAdmin, serviceControl.deleteService);

module.exports = router;
