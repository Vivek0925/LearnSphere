const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/subjects", require("./routes/subjects"));
app.use("/api/pyq", require("./routes/pyq"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/videos", require("./routes/videos"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "LearnSphere API running" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
