const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');

router.get('/profile-images/:filename', fileController.getProfileImage);
router.get('/resumes/:filename', fileController.getResume);

module.exports = router;
