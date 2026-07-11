const authService = require('../services/auth.service');
const ApiResponse = require('../utils/api-response');
const { getCurrentUserId } = require('../utils/security.utils');

const register = async (req, res, next) => {
  try {
    const response = await authService.register(req.body);
    return res.status(201).json(ApiResponse.success('User registered successfully', response));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const response = await authService.login(req.body);
    return res.status(200).json(ApiResponse.success('Login successful', response));
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const tokenStr = req.query.refreshToken || req.body.refreshToken;
    if (!tokenStr) {
      return res.status(400).json(ApiResponse.error('Refresh token is required'));
    }
    const response = await authService.refreshToken(tokenStr);
    return res.status(200).json(ApiResponse.success('Token refreshed successfully', response));
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    await authService.logout(userId);
    return res.status(200).json(ApiResponse.success('Logout successful', null));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
