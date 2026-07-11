const mongoose = require('mongoose');

const ParsedResumeDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  education: { type: [String], default: [] },
  experience: { type: [String], default: [] },
  certifications: { type: [String], default: [] }
}, { _id: false });

const ResumeAnalysisSchema = new mongoose.Schema({
  atsScore: Number,
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  recommendedSkills: { type: [String], default: [] },
  feedbackSummary: String
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  fileName: String,
  fileType: String,
  fileSize: Number,
  fileUrl: String,
  filePath: String,
  extractedText: String,
  parsedSkills: {
    type: [String],
    default: []
  },
  parsedData: ParsedResumeDataSchema,
  cloudinaryPublicId: String,
  analysis: ResumeAnalysisSchema
}, {
  timestamps: { createdAt: 'uploadedAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Resume', ResumeSchema);
