const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/api-response');
const { getCurrentUserId } = require('../utils/security.utils');

const getDashboard = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const dashboard = await dashboardService.getDashboard(userId);
    return res.status(200).json(ApiResponse.success(dashboard));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
