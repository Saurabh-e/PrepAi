const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/upload', requireAuth, upload.single('file'), resumeController.uploadResume);
router.get('/', requireAuth, resumeController.getUserResumes);
router.get('/latest', requireAuth, resumeController.getLatestResume);
router.delete('/:resumeId', requireAuth, resumeController.deleteResume);
router.get('/:resumeId/download-report', requireAuth, resumeController.downloadReport);
router.post('/:resumeId/match-jd', requireAuth, resumeController.matchResumeWithJD);
router.post('/:resumeId/download-match-report', requireAuth, resumeController.downloadMatchReport);

module.exports = router;
