const PYQAnalysis = require('../models/PYQAnalysis');

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))];
};

exports.createPYQ = async (req, res) => {
  try {
    const { subject, year, examType, fileName, topics, questions } = req.body;

    if (!subject || !fileName) {
      return res.status(400).json({ message: 'subject and fileName are required' });
    }

    const parsedYear = Number(year) || new Date().getFullYear();
    const safeExamType = examType === 'midterm' ? 'midterm' : 'endterm';

    const pyq = await PYQAnalysis.create({
      subject: String(subject).trim(),
      year: parsedYear,
      examType: safeExamType,
      fileName: String(fileName).trim(),
      topics: normalizeStringArray(topics),
      questions: normalizeStringArray(questions),
    });

    return res.status(201).json(pyq);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllPYQs = async (_req, res) => {
  try {
    const pyqs = await PYQAnalysis.find().sort({ createdAt: -1 });
    return res.json(pyqs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getPYQById = async (req, res) => {
  try {
    const pyq = await PYQAnalysis.findById(req.params.id);
    if (!pyq) return res.status(404).json({ message: 'PYQ not found' });
    return res.json(pyq);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deletePYQ = async (req, res) => {
  try {
    const deleted = await PYQAnalysis.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'PYQ not found' });
    return res.json({ message: 'PYQ deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
