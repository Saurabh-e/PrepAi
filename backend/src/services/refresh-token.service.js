const RefreshToken = require('../models/refresh-token.model');
const crypto = require('crypto');
const { UnauthorizedError } = require('../utils/errors');

const createRefreshToken = async (userId) => {
  const token = crypto.randomUUID();
  const expirationMs = parseInt(process.env.JWT_REFRESH_EXPIRATION) || 604800000; // 7 days default
  const expiryDate = new Date(Date.now() + expirationMs);
  
  const refreshToken = new RefreshToken({
    token,
    userId,
    expiryDate
  });
  
  await refreshToken.save();
  return refreshToken;
};

const verifyRefreshToken = async (tokenStr) => {
  const token = await RefreshToken.findOne({ token: tokenStr });
  if (!token) {
    throw new UnauthorizedError('Refresh token is invalid or does not exist');
  }
  
  if (token.expiryDate.getTime() < Date.now()) {
    await RefreshToken.deleteOne({ _id: token._id });
    throw new UnauthorizedError('Refresh token has expired. Please log in again.');
  }
  
  return token;
};

const deleteByUserId = async (userId) => {
  await RefreshToken.deleteMany({ userId });
};

module.exports = {
  createRefreshToken,
  verifyRefreshToken,
  deleteByUserId
};
