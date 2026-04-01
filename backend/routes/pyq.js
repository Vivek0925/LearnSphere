const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadPYQ, getPYQsBySubject, getAllPYQs, getPYQById } = require('../controllers/pyqController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `pyq_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.get('/', getAllPYQs);
router.get('/subject/:subjectId', getPYQsBySubject);
router.get('/:id', getPYQById);
router.post('/upload', auth, upload.single('pdf'), uploadPYQ);

module.exports = router;
