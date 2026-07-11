const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validate, changePasswordSchema } = require('../validators/validation.validator');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.post('/change-password', requireAuth, validate(changePasswordSchema), userController.changePassword);
router.post('/profile-image', requireAuth, upload.single('file'), userController.uploadProfileImage);
router.post('/skills', requireAuth, userController.addSkill);
router.delete('/skills', requireAuth, userController.removeSkill);

module.exports = router;
