const Note = require('../models/Note');
const PYQ = require('../models/PYQ');

const knowledgeBase = {
  'binary search': 'Binary Search is an efficient algorithm for finding an element in a sorted array. It works by repeatedly dividing the search space in half. Time complexity: O(log n). It compares the target with the middle element and eliminates half the array in each step.',
  'sorting': 'Common sorting algorithms: Bubble Sort (O(n²)), Selection Sort (O(n²)), Insertion Sort (O(n²) worst), Merge Sort (O(n log n)), Quick Sort (O(n log n) avg), Heap Sort (O(n log n)). Merge Sort and Heap Sort guarantee O(n log n).',
  'deadlock': 'Deadlock occurs when processes are stuck waiting for resources held by each other. Four conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Prevention: deny one condition. Detection: use resource allocation graph.',
  'normalization': 'Normalization eliminates redundancy: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency), BCNF (every determinant is a candidate key). Higher normal forms ensure better data integrity.',
  'osi model': 'OSI has 7 layers: Physical (bits), Data Link (frames/MAC), Network (routing/IP), Transport (TCP/UDP), Session (sessions), Presentation (encoding), Application (HTTP/FTP). Each layer serves the one above it.',
  'tcp': 'TCP (Transmission Control Protocol) is connection-oriented, reliable, ordered delivery with error checking. It uses 3-way handshake (SYN, SYN-ACK, ACK). Used for HTTP, FTP, SMTP.',
  'virtual memory': 'Virtual memory allows processes to use more memory than physically available by using disk space. Uses paging/segmentation. Page replacement algorithms: FIFO, LRU (Least Recently Used), Optimal.',
  'acid': 'ACID properties: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (transactions independent), Durability (committed changes persist). Essential for reliable database transactions.',
  'default': 'I can help you with topics like Data Structures (trees, graphs, sorting), Algorithms, Operating Systems (scheduling, deadlock), DBMS (normalization, SQL), Computer Networks (OSI, TCP/IP), and Software Engineering. Ask me anything specific!'
};

const findAnswer = (query) => {
  const q = query.toLowerCase();
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    if (q.includes(key)) return answer;
  }
  return knowledgeBase.default;
};

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const lowerMsg = message.toLowerCase();
    let response = '';
    let sources = [];

    // Search notes
    if (lowerMsg.includes('note') || lowerMsg.includes('explain') || lowerMsg.includes('what is') || lowerMsg.includes('define')) {
      const notes = await Note.find({ $text: { $search: message } }).limit(2).catch(() => []);
      if (notes.length > 0) {
        sources = notes.map(n => ({ type: 'note', title: n.title, subject: n.subjectName }));
      }
    }

    // PYQ trends query
    if (lowerMsg.includes('trend') || lowerMsg.includes('important') || lowerMsg.includes('exam')) {
      const pyqs = await PYQ.find().limit(5);
      if (pyqs.length > 0) {
        const allTopics = pyqs.flatMap(p => p.topicAnalysis);
        const topTopics = allTopics.sort((a, b) => b.importanceScore - a.importanceScore).slice(0, 3);
        response = `Based on PYQ analysis, the most important topics are: ${topTopics.map(t => `${t.topic} (score: ${t.importanceScore})`).join(', ')}. Focus on these for your exam preparation!`;
        sources = [{ type: 'pyq', title: 'PYQ Analysis' }];
      }
    }

    if (!response) {
      response = findAnswer(message);
    }

    // Simulate slight delay for AI feel
    setTimeout(() => {
      res.json({
        response,
        sources,
        timestamp: new Date(),
        model: 'LearnSphere AI (Mock)'
      });
    }, 500);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
