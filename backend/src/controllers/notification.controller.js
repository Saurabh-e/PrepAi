const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/api-response');
const { getCurrentUserId } = require('../utils/security.utils');

const getNotifications = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const notifications = await notificationService.getUserNotifications(userId);
    return res.status(200).json(ApiResponse.success(notifications));
  } catch (error) {
    next(error);
  }
};

const getNotificationsPaginated = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const notifications = await notificationService.getUserNotificationsPaginated(userId, page, size);
    return res.status(200).json(ApiResponse.success(notifications));
  } catch (error) {
    next(error);
  }
};

const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const notifications = await notificationService.getUnreadNotifications(userId);
    return res.status(200).json(ApiResponse.success(notifications));
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const count = await notificationService.getUnreadCount(userId);
    return res.status(200).json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.notificationId);
    return res.status(200).json(ApiResponse.success('Notification marked as read', null));
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    await notificationService.markAllAsRead(userId);
    return res.status(200).json(ApiResponse.success('All notifications marked as read', null));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotificationsPaginated,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
