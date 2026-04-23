const express = require('express');
const router = express.Router();
const { createPYQ, getAllPYQs, getPYQById, deletePYQ } = require('../controllers/pyqController');

router.route('/').get(getAllPYQs).post(createPYQ);
router.route('/:id').get(getPYQById).delete(deletePYQ);

module.exports = router;
