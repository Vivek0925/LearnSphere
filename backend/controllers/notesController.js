const Note = require('../models/Note');

exports.getNotesBySubject = async (req, res) => {
  try {
    const notes = await Note.find({ subjectName: req.params.subjectName });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const { search, subject } = req.query;
    const query = {};
    if (subject) query.subjectName = subject;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
    const notes = await Note.find(query).sort({ subjectName: 1, topic: 1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
