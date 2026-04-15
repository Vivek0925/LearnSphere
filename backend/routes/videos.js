const express = require('express');
const router = express.Router();

const videosController = require('../controllers/videosController');

// ✅ Use full object reference (safer)
router.get('/', videosController.getAllVideos);

module.exports = router;