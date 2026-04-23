const mongoose = require('mongoose');

const pyqAnalysisSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    examType: { type: String, enum: ['midterm', 'endterm'], default: 'endterm' },
    fileName: { type: String, required: true, trim: true },
    topics: [{ type: String, trim: true }],
    questions: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

pyqAnalysisSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('PYQAnalysis', pyqAnalysisSchema);
