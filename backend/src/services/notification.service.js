const Notification = require('../models/notification.model');

const createNotification = async (userId, type, title, message) => {
  console.log(`Creating notification for user: ${userId}`);
  
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    isRead: false
  });
  
  await notification.save();
  return notification;
};

const getUserNotifications = async (userId) => {
  console.log(`Getting notifications for user: ${userId}`);
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

const getUserNotificationsPaginated = async (userId, page = 0, size = 10) => {
  console.log(`Getting paginated notifications for user: ${userId}, page: ${page}, size: ${size}`);
  
  const totalElements = await Notification.countDocuments({ userId });
  const content = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(page * size)
    .limit(size);
    
  const totalPages = Math.ceil(totalElements / size);
  
  // Spring Data Page structure emulation
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size
    },
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
    first: page === 0,
    size,
    number: page,
    numberOfElements: content.length,
    empty: content.length === 0
  };
};

const getUnreadNotifications = async (userId) => {
  console.log(`Getting unread notifications for user: ${userId}`);
  return await Notification.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, isRead: false });
};

const markAsRead = async (notificationId) => {
  console.log(`Marking notification as read: ${notificationId}`);
  const notification = await Notification.findById(notificationId);
  if (notification) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }
};

const markAllAsRead = async (userId) => {
  console.log(`Marking all notifications as read for user: ${userId}`);
  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUserNotificationsPaginated,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
