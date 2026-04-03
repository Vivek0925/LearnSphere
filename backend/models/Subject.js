const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  importanceScore: { type: Number, default: 50, min: 0, max: 100 },
  trend: { type: String, enum: ['rising', 'stable', 'declining'], default: 'stable' },
  pyqCount: { type: Number, default: 0 },
  tags: [{ type: String }]
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String, default: '📚' },
  color: { type: String, default: '#6366f1' },
  topics: [topicSchema],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  totalQuestions: { type: Number, default: 0 },
  semester: { type: Number, required: true, min: 1, max: 8 },  // NEW
  branch: { type: String, default: 'CSE' }                      // NEW
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);