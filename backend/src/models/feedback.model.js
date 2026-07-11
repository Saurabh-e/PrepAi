const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema({
  topic: String,
  resourceUrl: String,
  description: String
}, { _id: false });

const CommunicationAnalysisSchema = new mongoose.Schema({
  clarity: Number,
  articulation: Number,
  confidence: Number,
  feedback: String
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  overallScore: Number,
  overallSummary: String,
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  },
  learningResources: {
    type: [LearningResourceSchema],
    default: []
  },
  skillScores: {
    type: Map,
    of: Number,
    default: {}
  },
  communication: CommunicationAnalysisSchema
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
