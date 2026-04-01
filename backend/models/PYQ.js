const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  topic: { type: String },
  marks: { type: Number, default: 5 },
  year: { type: Number },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

const pyqSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String },
  filePath: { type: String },
  examYear: { type: Number },
  examType: { type: String, enum: ['midterm', 'endterm', 'quiz', 'assignment'], default: 'endterm' },
  questions: [questionSchema],
  extractedText: { type: String },
  topicAnalysis: [{
    topic: String,
    count: Number,
    importanceScore: Number,
    trend: { type: String, enum: ['rising', 'stable', 'declining'], default: 'stable' }
  }],
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('PYQ', pyqSchema);
