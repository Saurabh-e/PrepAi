const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

// Apply requireAuth and requireAdmin to all endpoints in this router
router.use(requireAuth);
router.use(requireAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/users/search', adminController.searchUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/suspend', adminController.suspendUser);
router.patch('/users/:userId/activate', adminController.activateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/analytics', adminController.getPlatformAnalytics);
router.get('/ai-usage', adminController.getAIUsageStatistics);

module.exports = router;
