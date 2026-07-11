const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/api-response');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const result = await adminService.getAllUsers(page, size);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json(ApiResponse.error('Email parameter is required'));
    }
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const result = await adminService.searchUsers(email, page, size);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await adminService.getUserById(req.params.userId);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    await adminService.suspendUser(req.params.userId);
    return res.status(200).json(ApiResponse.success('User suspended successfully', null));
  } catch (error) {
    next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    await adminService.activateUser(req.params.userId);
    return res.status(200).json(ApiResponse.success('User activated successfully', null));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.userId);
    return res.status(200).json(ApiResponse.success('User deleted successfully', null));
  } catch (error) {
    next(error);
  }
};

const getPlatformAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getPlatformAnalytics();
    return res.status(200).json(ApiResponse.success(analytics));
  } catch (error) {
    next(error);
  }
};

const getAIUsageStatistics = async (req, res, next) => {
  try {
    const stats = await adminService.getAIUsageStatistics();
    return res.status(200).json(ApiResponse.success(stats));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  searchUsers,
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  getPlatformAnalytics,
  getAIUsageStatistics
};
