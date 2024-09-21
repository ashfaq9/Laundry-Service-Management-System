const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const authenticateUser = require('../middlewares/authMiddleware');
const feedbackValidation = require('../validations/feedbackValidation');


router.post('/', authenticateUser, feedbackValidation, feedbackController.addFeedback);
router.get('/order/:orderId', authenticateUser, feedbackController.getFeedbackByOrder);
router.get('/', feedbackController.getAllFeedback);
router.put('/:id', authenticateUser, feedbackValidation, feedbackController.updateFeedback);
router.delete('/:id', authenticateUser, feedbackController.deleteFeedback);

router.post('/response/:feedbackId',authenticateUser,feedbackController.addResponse)
router.delete('/:feedbackId/response/:responseId',authenticateUser,feedbackController.deleteResponse)
module.exports = router;
