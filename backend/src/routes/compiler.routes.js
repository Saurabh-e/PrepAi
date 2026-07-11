const express = require('express');
const router = express.Router();
const compilerController = require('../controllers/compiler.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.post('/run', requireAuth, compilerController.compileAndRun);

module.exports = router;
