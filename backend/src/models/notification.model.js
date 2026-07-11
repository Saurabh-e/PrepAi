const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['INTERVIEW_COMPLETED', 'RESUME_UPLOADED', 'PROFILE_UPDATED', 'ACHIEVEMENT_UNLOCKED', 'SYSTEM_ALERT'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
