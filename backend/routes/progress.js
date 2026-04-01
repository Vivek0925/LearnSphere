const express = require('express');
const router = express.Router();
const { getUserProgress, getSubjectProgress, updateProgress, getPriorityRecommendations } = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.get('/', auth, getUserProgress);
router.get('/recommendations', auth, getPriorityRecommendations);
router.get('/:subjectId', auth, getSubjectProgress);
router.post('/update', auth, updateProgress);

module.exports = router;
