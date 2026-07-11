const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, notificationController.getNotifications);
router.get('/paginated', requireAuth, notificationController.getNotificationsPaginated);
router.get('/unread', requireAuth, notificationController.getUnreadNotifications);
router.get('/unread/count', requireAuth, notificationController.getUnreadCount);
router.patch('/:notificationId/read', requireAuth, notificationController.markAsRead);
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);

module.exports = router;
