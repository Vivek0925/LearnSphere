const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  masteryLevel: { type: Number, default: 0, min: 0, max: 100 },
  lastStudied: { type: Date }
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectName: { type: String, required: true },
  overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  topicsProgress: [topicProgressSchema],
  studyTime: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
