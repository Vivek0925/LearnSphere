const express = require('express');
const router = express.Router();

const {
  getAllNotes,
  getNotesBySubject,
  getNoteById
} = require('../controllers/notesController');

router.get('/', getAllNotes);
router.get('/subject/:subjectName', getNotesBySubject);
router.get('/:id', getNoteById);

module.exports = router;