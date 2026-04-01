const Progress = require('../models/Progress');
const Subject = require('../models/Subject');

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubjectProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id, subjectId: req.params.subjectId });
    if (!progress) {
      const subject = await Subject.findById(req.params.subjectId);
      if (!subject) return res.status(404).json({ message: 'Subject not found' });
      progress = await Progress.create({
        userId: req.user._id,
        subjectId: req.params.subjectId,
        subjectName: subject.name,
        overallProgress: 0,
        topicsProgress: subject.topics.map(t => ({ topicName: t.name, attempts: 0, correct: 0, masteryLevel: 0 }))
      });
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { subjectId, topicName, correct, total } = req.body;
    let progress = await Progress.findOne({ userId: req.user._id, subjectId });
    
    if (!progress) {
      const subject = await Subject.findById(subjectId);
      progress = new Progress({ userId: req.user._id, subjectId, subjectName: subject.name, topicsProgress: [] });
    }

    const topicIdx = progress.topicsProgress.findIndex(t => t.topicName === topicName);
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const masteryIncrease = Math.min(10, accuracy / 10);

    if (topicIdx >= 0) {
      progress.topicsProgress[topicIdx].attempts += total;
      progress.topicsProgress[topicIdx].correct += correct;
      progress.topicsProgress[topicIdx].masteryLevel = Math.min(100, progress.topicsProgress[topicIdx].masteryLevel + masteryIncrease);
      progress.topicsProgress[topicIdx].lastStudied = new Date();
    } else {
      progress.topicsProgress.push({ topicName, attempts: total, correct, masteryLevel: Math.min(100, masteryIncrease), lastStudied: new Date() });
    }

    const totalMastery = progress.topicsProgress.reduce((sum, t) => sum + t.masteryLevel, 0);
    progress.overallProgress = Math.round(totalMastery / Math.max(1, progress.topicsProgress.length));
    progress.lastActive = new Date();

    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPriorityRecommendations = async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.user._id });
    const subjects = await Subject.find();

    const recommendations = [];
    subjects.forEach(subject => {
      const subjectProgress = progressList.find(p => p.subjectId.toString() === subject._id.toString());
      subject.topics.forEach(topic => {
        const topicProgress = subjectProgress?.topicsProgress.find(t => t.topicName === topic.name);
        const mastery = topicProgress?.masteryLevel || 0;
        const weakness = 100 - mastery;
        const priorityScore = (topic.importanceScore * 0.6) + (weakness * 0.4);
        recommendations.push({
          subjectName: subject.name,
          subjectCode: subject.code,
          topicName: topic.name,
          importanceScore: topic.importanceScore,
          masteryLevel: mastery,
          priorityScore: Math.round(priorityScore),
          trend: topic.trend
        });
      });
    });

    recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
    res.json(recommendations.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
