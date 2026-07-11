const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
