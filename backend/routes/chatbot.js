const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { chat } = require("../controllers/chatbotController");

// 📁 ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// 📦 storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `chat_${Date.now()}_${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`),
});

// 📦 multer setup
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});


// 🔥 MAIN ROUTE (MULTIPLE FILES)
router.post("/chat", upload.array("pdfs", 10), chat);


// 🔍 OPTIONAL GET (for testing)
router.get("/chat", (req, res, next) => {
  req.body = {
    message: req.query.message || "",
    subjectId: req.query.subjectId || null,
    examYear: req.query.examYear || null,
    examType: req.query.examType || "endterm",
  };
  next();
}, chat);

module.exports = router;