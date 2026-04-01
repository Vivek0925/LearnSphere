const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String, required: true },
  topic: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  keyPoints: [{ type: String }],
  formulas: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [{ type: String }],
  readTime: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
