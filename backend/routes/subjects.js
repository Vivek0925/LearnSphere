const express = require('express');
const router = express.Router();
const { getAllSubjects, getSubjectById, getSubjectByCode } = require('../controllers/subjectController');

router.get('/', getAllSubjects);
router.get('/code/:code', getSubjectByCode);
router.get('/:id', getSubjectById);

module.exports = router;
