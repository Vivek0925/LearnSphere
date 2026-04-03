const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { chat } = require("../controllers/chatbotController");

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `chat_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});

router.post("/message", upload.single("pdf"), chat);
router.get(
  "/message",
  (req, res, next) => {
    req.body = {
      message: req.query.message || "",
      history: req.query.history || "[]",
      subjectId: req.query.subjectId || null,
      examYear: req.query.examYear || null,
      examType: req.query.examType || "endterm",
    };
    next();
  },
  chat,
);

module.exports = router;
