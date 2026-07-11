const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    enum: ['JAVA', 'SPRING_BOOT', 'MERN', 'DSA', 'HR', 'SQL', 'JAVASCRIPT', 'CODEFORCES'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  completedQuestions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'PAUSED', 'ABANDONED'],
    default: 'IN_PROGRESS'
  },
  questionIds: {
    type: [String],
    default: []
  },
  overallScore: Number,
  overallFeedback: String,
  aiModel: String,
  completedAt: Date,
  durationMinutes: Number
}, {
  timestamps: { createdAt: 'startedAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Interview', InterviewSchema);
