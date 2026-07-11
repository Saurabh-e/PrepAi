const User = require('../models/user.model');
const refreshTokenService = require('./refresh-token.service');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const modelMapper = require('../utils/model-mapper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (request) => {
  console.log(`Registering new user with email: ${request.email}`);
  
  const existingUser = await User.findOne({ email: request.email });
  if (existingUser) {
    throw new BadRequestError('Email already exists');
  }
  
  const hashedPassword = await bcrypt.hash(request.password, 10);
  const user = new User({
    email: request.email,
    password: hashedPassword,
    firstName: request.firstName,
    lastName: request.lastName,
    phone: request.phone || null,
    roles: ['USER'],
    status: 'ACTIVE'
  });
  
  await user.save();
  console.log(`User registered successfully: ${user._id}`);
  
  const accessToken = generateToken(user.email);
  const refreshToken = await refreshTokenService.createRefreshToken(user._id.toString());
  
  return buildAuthResponse(user, accessToken, refreshToken.token);
};

const login = async (request) => {
  console.log(`User login attempt: ${request.email}`);
  
  const user = await User.findOne({ email: request.email });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  const isMatch = await bcrypt.compare(request.password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  if (user.status === 'SUSPENDED') {
    throw new BadRequestError('Your account is suspended');
  }
  if (user.status === 'DELETED') {
    throw new BadRequestError('Your account has been deleted');
  }
  
  user.lastLoginAt = new Date();
  await user.save();
  
  const accessToken = generateToken(user.email);
  
  // Delete old refresh tokens
  await refreshTokenService.deleteByUserId(user._id.toString());
  const refreshToken = await refreshTokenService.createRefreshToken(user._id.toString());
  
  console.log(`User logged in successfully: ${user._id}`);
  return buildAuthResponse(user, accessToken, refreshToken.token);
};

const refreshToken = async (refreshTokenStr) => {
  console.log('Refreshing access token');
  
  const token = await refreshTokenService.verifyRefreshToken(refreshTokenStr);
  const user = await User.findById(token.userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  
  const newAccessToken = generateToken(user.email);
  console.log(`Access token refreshed for user: ${user._id}`);
  
  return buildAuthResponse(user, newAccessToken, refreshTokenStr);
};

const logout = async (userId) => {
  console.log(`User logout: ${userId}`);
  await refreshTokenService.deleteByUserId(userId);
};

const generateToken = (email, additionalClaims = {}) => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-key-minimum-256-bits-long-for-production-use';
  const expirationMs = parseInt(process.env.JWT_EXPIRATION) || 86400000;
  
  return jwt.sign({ sub: email, ...additionalClaims }, secret, {
    expiresIn: Math.floor(expirationMs / 1000)
  });
};

const buildAuthResponse = (user, accessToken, refreshToken) => {
  const expirationMs = parseInt(process.env.JWT_EXPIRATION) || 86400000;
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: Math.floor(expirationMs / 1000),
    user: toUserDTO(user)
  };
};

// Internal mapping because auth user payload is simpler than UserProfileDTO
const toUserDTO = (user) => {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles
  };
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
