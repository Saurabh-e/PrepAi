const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiResponse = require('../utils/api-response');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json(ApiResponse.error('Access token is missing or invalid', 'UNAUTHORIZED'));
    }

    const secret = process.env.JWT_SECRET || 'your-super-secret-key-minimum-256-bits-long-for-production-use';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json(ApiResponse.error('Access token has expired or is invalid', 'UNAUTHORIZED'));
    }

    const user = await User.findOne({ email: decoded.sub });
    if (!user) {
      return res.status(401).json(ApiResponse.error('User not found', 'UNAUTHORIZED'));
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json(ApiResponse.error('Your account is suspended', 'FORBIDDEN'));
    }

    if (user.status === 'DELETED') {
      return res.status(403).json(ApiResponse.error('Your account has been deleted', 'FORBIDDEN'));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json(ApiResponse.error('Server authentication error'));
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes('ADMIN')) {
    return res.status(403).json(ApiResponse.error('Access denied. Admin role required.', 'FORBIDDEN'));
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
