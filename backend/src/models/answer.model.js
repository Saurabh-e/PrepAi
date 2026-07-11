const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  interviewId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  answerText: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  technicalFeedback: String,
  communicationFeedback: String,
  improvements: String,
  aiResponse: {
    type: String,
    default: ''
  },
  responseTimeSeconds: Number
}, {
  timestamps: { createdAt: 'answeredAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Answer', AnswerSchema);
