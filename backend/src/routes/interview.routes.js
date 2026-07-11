const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate, startInterviewSchema, submitAnswerSchema } = require('../validators/validation.validator');

router.post('/start', requireAuth, validate(startInterviewSchema), interviewController.startInterview);
router.get('/current', requireAuth, interviewController.getCurrentInterview);
router.get('/next-question', requireAuth, interviewController.getNextQuestion);
router.post('/submit-answer', requireAuth, validate(submitAnswerSchema), interviewController.submitAnswer);
router.post('/:interviewId/end', requireAuth, interviewController.endInterview);
router.get('/history', requireAuth, interviewController.getInterviewHistory);
router.get('/:interviewId', requireAuth, interviewController.getInterviewDetails);

module.exports = router;
