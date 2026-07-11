const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  currentRole: String,
  company: String,
  yearsOfExperience: Number,
  education: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: String,
  profileImageUrl: String,
  roles: {
    type: [String],
    enum: ['USER', 'ADMIN'],
    default: ['USER']
  },
  skills: {
    type: [String],
    default: []
  },
  experience: ExperienceSchema,
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'DELETED'],
    default: 'ACTIVE'
  },
  lastLoginAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
