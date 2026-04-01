const Video = require('../models/Video');

exports.getVideosBySubject = async (req, res) => {
  try {
    const videos = await Video.find({ subjectName: req.params.subjectName });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const { subject, topic } = req.query;
    const query = {};
    if (subject) query.subjectName = subject;
    if (topic) query.topic = { $regex: topic, $options: 'i' };
    const videos = await Video.find(query);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
