const express = require('express');
const router = express.Router();
const { getAllVideos, getVideosBySubject } = require('../controllers/videosController');

router.get('/', getAllVideos);
router.get('/subject/:subjectName', getVideosBySubject);

module.exports = router;
