require("dotenv").config(); // 🔥 MUST BE FIRST LINE

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// 🔥 DEBUG: check env loading
console.log("🔑 OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

// ================= MIDDLEWARE =================       
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/subjects", require("./routes/subjects"));
app.use("/api/pyq", require("./routes/pyq"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/videos", require("./routes/videos"));

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "LearnSphere API running",
    envLoaded: !!process.env.OPENROUTER_API_KEY, // 🔥 check
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ message: err.message });
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

  module.exports = app;