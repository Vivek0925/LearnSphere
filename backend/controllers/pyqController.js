const PYQ = require('../models/PYQ');
const Subject = require('../models/Subject');

// Mock question extraction
const extractQuestionsFromPDF = (subjectName) => {
  const mockQuestions = {
    'Data Structures': [
      { text: 'Explain the working of AVL trees with rotations. Write an algorithm for insertion.', topic: 'Trees', marks: 10, year: 2023, difficulty: 'hard' },
      { text: 'What is a hash table? Discuss collision resolution techniques.', topic: 'Hashing', marks: 8, year: 2023, difficulty: 'medium' },
      { text: 'Write an algorithm for BFS and DFS graph traversal.', topic: 'Graph', marks: 10, year: 2023, difficulty: 'medium' },
      { text: 'Explain dynamic programming approach with an example.', topic: 'Dynamic Programming', marks: 8, year: 2022, difficulty: 'hard' },
      { text: 'Compare linked lists and arrays. When would you use each?', topic: 'Arrays & Linked Lists', marks: 6, year: 2022, difficulty: 'easy' }
    ],
    'Algorithms': [
      { text: 'Explain the Quick Sort algorithm with its time complexity analysis.', topic: 'Sorting', marks: 10, year: 2023, difficulty: 'medium' },
      { text: 'What is the traveling salesman problem? Discuss approaches.', topic: 'NP Problems', marks: 10, year: 2023, difficulty: 'hard' },
      { text: 'Explain Dijkstra\'s shortest path algorithm with example.', topic: 'Graph Algorithms', marks: 8, year: 2022, difficulty: 'medium' }
    ],
    'Operating Systems': [
      { text: 'Explain the concept of deadlock. What are the four necessary conditions?', topic: 'Deadlock', marks: 10, year: 2023, difficulty: 'medium' },
      { text: 'Compare preemptive and non-preemptive scheduling algorithms.', topic: 'CPU Scheduling', marks: 8, year: 2023, difficulty: 'medium' },
      { text: 'What is virtual memory? Explain page replacement algorithms.', topic: 'Memory Management', marks: 10, year: 2022, difficulty: 'hard' }
    ],
    'DBMS': [
      { text: 'Explain the concept of normalization up to BCNF with examples.', topic: 'Normalization', marks: 10, year: 2023, difficulty: 'hard' },
      { text: 'What are ACID properties in database transactions?', topic: 'Transactions', marks: 8, year: 2023, difficulty: 'medium' },
      { text: 'Explain ER model and its components with an example.', topic: 'ER Model', marks: 8, year: 2022, difficulty: 'easy' }
    ],
    'Computer Networks': [
      { text: 'Explain the OSI model layers with their functions.', topic: 'OSI Model', marks: 10, year: 2023, difficulty: 'medium' },
      { text: 'What is TCP/IP protocol suite? Compare TCP and UDP.', topic: 'TCP/IP', marks: 8, year: 2023, difficulty: 'medium' },
      { text: 'Explain subnetting with an example.', topic: 'IP Addressing', marks: 8, year: 2022, difficulty: 'hard' }
    ],
    'Software Engineering': [
      { text: 'Compare waterfall and agile software development models.', topic: 'SDLC Models', marks: 10, year: 2023, difficulty: 'easy' },
      { text: 'What is software testing? Explain black-box and white-box testing.', topic: 'Testing', marks: 8, year: 2023, difficulty: 'medium' },
      { text: 'Explain UML diagrams with examples.', topic: 'UML', marks: 8, year: 2022, difficulty: 'medium' }
    ]
  };
  return mockQuestions[subjectName] || mockQuestions['Data Structures'];
};

const analyzeTopics = (questions) => {
  const topicMap = {};
  questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { count: 0, totalMarks: 0 };
    topicMap[q.topic].count++;
    topicMap[q.topic].totalMarks += q.marks;
  });
  const trends = ['rising', 'stable', 'declining'];
  return Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    count: data.count,
    importanceScore: Math.min(100, data.count * 25 + data.totalMarks * 2),
    trend: trends[Math.floor(Math.random() * trends.length)]
  }));
};

exports.uploadPYQ = async (req, res) => {
  try {
    const { subjectId, examYear, examType } = req.body;
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const questions = extractQuestionsFromPDF(subject.name);
    const topicAnalysis = analyzeTopics(questions);

    const pyq = await PYQ.create({
      subjectId,
      subjectName: subject.name,
      uploadedBy: req.user?._id,
      fileName: req.file ? req.file.originalname : `${subject.name}_${examYear}.pdf`,
      filePath: req.file ? req.file.path : null,
      examYear: parseInt(examYear) || new Date().getFullYear(),
      examType: examType || 'endterm',
      questions,
      extractedText: questions.map(q => q.text).join('\n\n'),
      topicAnalysis,
      status: 'completed'
    });
    res.status(201).json({ message: 'PYQ uploaded and analyzed successfully', pyq });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPYQsBySubject = async (req, res) => {
  try {
    const pyqs = await PYQ.find({ subjectId: req.params.subjectId }).sort({ examYear: -1 });
    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPYQs = async (req, res) => {
  try {
    const pyqs = await PYQ.find().sort({ createdAt: -1 });
    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPYQById = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id).populate('subjectId');
    if (!pyq) return res.status(404).json({ message: 'PYQ not found' });
    res.json(pyq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
