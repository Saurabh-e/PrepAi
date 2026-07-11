const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: String,
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD']
  },
  aiGeneratedContext: String,
  
  // Coding Problem details (populated for CODEFORCES domain)
  isCodingProblem: Boolean,
  problemTitle: String,
  problemDescription: String,
  inputSpecification: String,
  outputSpecification: String,
  sampleTestsJson: String, // Serialized list of SampleTest objects
  timeLimit: String,
  memoryLimit: String,
  note: String
}, {
  timestamps: { createdAt: 'askedAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Question', QuestionSchema);
