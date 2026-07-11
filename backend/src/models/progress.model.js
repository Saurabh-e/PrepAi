const mongoose = require('mongoose');

const DomainProgressSchema = new mongoose.Schema({
  interviewsCompleted: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0.0 },
  lastDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'] }
}, { _id: false });

const SkillAnalyticsSchema = new mongoose.Schema({
  averageScore: { type: Number, default: 0.0 },
  timesAssessed: { type: Number, default: 0 },
  strength: { type: String, enum: ['STRONG', 'MODERATE', 'WEAK'] }
}, { _id: false });

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0.0
  },
  highestScore: {
    type: Number,
    default: 0.0
  },
  domainProgress: {
    type: Map,
    of: DomainProgressSchema,
    default: {}
  },
  skillAnalytics: {
    type: Map,
    of: SkillAnalyticsSchema,
    default: {}
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'lastUpdated' }
});

module.exports = mongoose.model('Progress', ProgressSchema);
