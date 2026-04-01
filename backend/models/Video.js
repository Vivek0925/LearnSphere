const mongoose = require('mongoose');

const timestampSchema = new mongoose.Schema({
  time: { type: String, required: true },
  label: { type: String, required: true },
  seconds: { type: Number, required: true }
});

const videoSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  topic: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  youtubeId: { type: String, required: true },
  duration: { type: String },
  timestamps: [timestampSchema],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
