const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Subject = require('../models/Subject');
const Note = require('../models/Note');
const Video = require('../models/Video');

const subjects = [
  {
    name: 'Data Structures',
    code: 'DS',
    description: 'Study of organizing and storing data efficiently',
    icon: '🌳',
    color: '#6366f1',
    difficulty: 'medium',
    topics: [
      { name: 'Arrays & Linked Lists', importanceScore: 75, trend: 'stable', pyqCount: 8, tags: ['arrays', 'pointers'] },
      { name: 'Trees', importanceScore: 90, trend: 'rising', pyqCount: 12, tags: ['binary tree', 'BST', 'AVL'] },
      { name: 'Graph', importanceScore: 85, trend: 'rising', pyqCount: 10, tags: ['BFS', 'DFS', 'shortest path'] },
      { name: 'Hashing', importanceScore: 80, trend: 'stable', pyqCount: 9, tags: ['hash table', 'collision'] },
      { name: 'Dynamic Programming', importanceScore: 95, trend: 'rising', pyqCount: 14, tags: ['memoization', 'tabulation'] },
      { name: 'Stacks & Queues', importanceScore: 70, trend: 'stable', pyqCount: 7, tags: ['LIFO', 'FIFO'] }
    ]
  },
  {
    name: 'Algorithms',
    code: 'ALGO',
    description: 'Design and analysis of computational algorithms',
    icon: '⚡',
    color: '#f59e0b',
    difficulty: 'hard',
    topics: [
      { name: 'Sorting', importanceScore: 88, trend: 'stable', pyqCount: 11, tags: ['quicksort', 'mergesort', 'heapsort'] },
      { name: 'Graph Algorithms', importanceScore: 92, trend: 'rising', pyqCount: 13, tags: ['Dijkstra', 'Bellman-Ford', 'Floyd'] },
      { name: 'Divide & Conquer', importanceScore: 78, trend: 'stable', pyqCount: 8, tags: ['recursion', 'merge sort'] },
      { name: 'Greedy Algorithms', importanceScore: 82, trend: 'stable', pyqCount: 9, tags: ['Kruskal', 'Prim'] },
      { name: 'NP Problems', importanceScore: 70, trend: 'declining', pyqCount: 6, tags: ['NP-hard', 'reduction'] }
    ]
  },
  {
    name: 'Operating Systems',
    code: 'OS',
    description: 'Fundamentals of operating system design and implementation',
    icon: '💻',
    color: '#10b981',
    difficulty: 'hard',
    topics: [
      { name: 'CPU Scheduling', importanceScore: 90, trend: 'stable', pyqCount: 12, tags: ['FCFS', 'SJF', 'Round Robin'] },
      { name: 'Deadlock', importanceScore: 88, trend: 'rising', pyqCount: 11, tags: ['prevention', 'detection', 'avoidance'] },
      { name: 'Memory Management', importanceScore: 85, trend: 'stable', pyqCount: 10, tags: ['paging', 'segmentation', 'virtual memory'] },
      { name: 'File Systems', importanceScore: 72, trend: 'stable', pyqCount: 7, tags: ['FAT', 'inode', 'disk scheduling'] },
      { name: 'Synchronization', importanceScore: 80, trend: 'rising', pyqCount: 9, tags: ['mutex', 'semaphore', 'monitor'] }
    ]
  },
  {
    name: 'DBMS',
    code: 'DBMS',
    description: 'Database Management Systems principles and design',
    icon: '🗄️',
    color: '#3b82f6',
    difficulty: 'medium',
    topics: [
      { name: 'ER Model', importanceScore: 80, trend: 'stable', pyqCount: 9, tags: ['entity', 'relationship', 'cardinality'] },
      { name: 'Normalization', importanceScore: 92, trend: 'rising', pyqCount: 13, tags: ['1NF', '2NF', '3NF', 'BCNF'] },
      { name: 'SQL', importanceScore: 95, trend: 'rising', pyqCount: 15, tags: ['joins', 'subqueries', 'aggregation'] },
      { name: 'Transactions', importanceScore: 85, trend: 'stable', pyqCount: 10, tags: ['ACID', 'concurrency', 'locking'] },
      { name: 'Indexing', importanceScore: 78, trend: 'stable', pyqCount: 8, tags: ['B-tree', 'hash index'] }
    ]
  },
  {
    name: 'Computer Networks',
    code: 'CN',
    description: 'Data communication and computer networking fundamentals',
    icon: '🌐',
    color: '#ec4899',
    difficulty: 'medium',
    topics: [
      { name: 'OSI Model', importanceScore: 90, trend: 'stable', pyqCount: 12, tags: ['layers', 'protocols'] },
      { name: 'TCP/IP', importanceScore: 92, trend: 'rising', pyqCount: 13, tags: ['TCP', 'UDP', 'IP'] },
      { name: 'IP Addressing', importanceScore: 85, trend: 'stable', pyqCount: 10, tags: ['subnetting', 'IPv4', 'IPv6'] },
      { name: 'Routing', importanceScore: 78, trend: 'stable', pyqCount: 8, tags: ['RIP', 'OSPF', 'BGP'] },
      { name: 'Application Layer', importanceScore: 75, trend: 'rising', pyqCount: 7, tags: ['HTTP', 'FTP', 'DNS'] }
    ]
  },
  {
    name: 'Software Engineering',
    code: 'SE',
    description: 'Software development methodologies and best practices',
    icon: '🔧',
    color: '#8b5cf6',
    difficulty: 'easy',
    topics: [
      { name: 'SDLC Models', importanceScore: 85, trend: 'stable', pyqCount: 10, tags: ['waterfall', 'agile', 'spiral'] },
      { name: 'Testing', importanceScore: 88, trend: 'rising', pyqCount: 11, tags: ['unit', 'integration', 'black-box'] },
      { name: 'UML', importanceScore: 80, trend: 'stable', pyqCount: 9, tags: ['class diagram', 'sequence', 'use case'] },
      { name: 'Design Patterns', importanceScore: 78, trend: 'rising', pyqCount: 8, tags: ['singleton', 'observer', 'factory'] },
      { name: 'Project Management', importanceScore: 70, trend: 'stable', pyqCount: 6, tags: ['estimation', 'scheduling', 'risk'] }
    ]
  }
];

const notes = [
  {
    subjectName: 'Data Structures',
    topic: 'Trees',
    title: 'Binary Search Trees - Complete Guide',
    content: 'A Binary Search Tree (BST) is a tree data structure where each node has at most two children, referred to as the left and right child. For every node, all nodes in the left subtree have values less than the node, and all nodes in the right subtree have values greater. Operations: Search O(h), Insert O(h), Delete O(h) where h is height. Balanced BST: O(log n) height.',
    keyPoints: ['Left child < Parent < Right child', 'In-order traversal gives sorted output', 'AVL trees maintain balance with rotations', 'Red-Black trees used in Java TreeMap'],
    formulas: ['Height of balanced BST: O(log n)', 'Height of skewed BST: O(n)', 'Max nodes at level i: 2^i'],
    difficulty: 'medium',
    tags: ['BST', 'trees', 'data structures'],
    readTime: 8
  },
  {
    subjectName: 'Data Structures',
    topic: 'Dynamic Programming',
    title: 'Dynamic Programming - Master Guide',
    content: 'Dynamic Programming solves complex problems by breaking them into overlapping subproblems and storing results to avoid recomputation. Two approaches: Top-down (Memoization) uses recursion + cache. Bottom-up (Tabulation) fills table iteratively. Key: Optimal substructure + Overlapping subproblems.',
    keyPoints: ['Identify overlapping subproblems', 'Define state clearly', 'Write recurrence relation', 'Implement memoization or tabulation', 'Classic: LCS, LIS, Knapsack, Edit Distance'],
    formulas: ['Fibonacci: dp[n] = dp[n-1] + dp[n-2]', 'Knapsack: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])'],
    difficulty: 'hard',
    tags: ['DP', 'optimization', 'recursion'],
    readTime: 12
  },
  {
    subjectName: 'Operating Systems',
    topic: 'Deadlock',
    title: 'Deadlock - Detection and Prevention',
    content: 'A deadlock is a situation where a set of processes are blocked, each waiting for a resource held by another process in the set. Four necessary conditions must hold simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Strategies: Prevention (deny a condition), Avoidance (Banker\'s algorithm), Detection and Recovery.',
    keyPoints: ['All 4 conditions must hold for deadlock', 'Banker\'s Algorithm for avoidance', 'Resource Allocation Graph for detection', 'Recovery: kill process or preempt resource'],
    formulas: ['Safe state condition: need[i] ≤ available for some process', 'Deadlock detection: check for cycle in RAG'],
    difficulty: 'medium',
    tags: ['deadlock', 'OS', 'synchronization'],
    readTime: 10
  },
  {
    subjectName: 'DBMS',
    topic: 'Normalization',
    title: 'Database Normalization - 1NF to BCNF',
    content: 'Normalization is the process of organizing a database to reduce redundancy and improve data integrity. 1NF: Atomic values, no repeating groups. 2NF: No partial dependencies (non-key attributes depend on full primary key). 3NF: No transitive dependencies. BCNF: Every determinant is a candidate key.',
    keyPoints: ['1NF: Atomic values only', '2NF: Remove partial dependencies', '3NF: Remove transitive dependencies', 'BCNF: Stricter than 3NF', 'Denormalization for performance'],
    formulas: ['Functional Dependency: X → Y', 'Armstrong\'s Axioms: Reflexivity, Augmentation, Transitivity'],
    difficulty: 'hard',
    tags: ['normalization', 'DBMS', 'SQL'],
    readTime: 15
  },
  {
    subjectName: 'Computer Networks',
    topic: 'OSI Model',
    title: 'OSI Model - All 7 Layers Explained',
    content: 'The OSI model is a conceptual framework for understanding network communication. Layer 7 (Application): HTTP, FTP, SMTP. Layer 6 (Presentation): Encryption, compression. Layer 5 (Session): Session management. Layer 4 (Transport): TCP, UDP, port numbers. Layer 3 (Network): IP routing. Layer 2 (Data Link): MAC addresses, frames. Layer 1 (Physical): Bits, cables.',
    keyPoints: ['Mnemonic: All People Seem To Need Data Processing', 'Each layer serves the layer above', 'TCP/IP has 4 layers (condensed)', 'PDU names: bit, frame, packet, segment, data'],
    formulas: [],
    difficulty: 'easy',
    tags: ['OSI', 'networking', 'protocols'],
    readTime: 8
  },
  {
    subjectName: 'Algorithms',
    topic: 'Sorting',
    title: 'Sorting Algorithms - Time & Space Complexity',
    content: 'Sorting algorithms arrange elements in a specific order. Bubble Sort: O(n²) - simple, stable. Selection Sort: O(n²) - not stable. Insertion Sort: O(n²) worst, O(n) best - stable, good for nearly sorted data. Merge Sort: O(n log n) - stable, uses O(n) space. Quick Sort: O(n log n) avg - not stable, in-place. Heap Sort: O(n log n) - not stable, in-place.',
    keyPoints: ['Merge Sort: best for linked lists', 'Quick Sort: best for arrays in practice', 'Counting Sort: O(n+k) for small integer ranges', 'Stability matters when sorting objects by multiple keys'],
    formulas: ['Merge Sort: T(n) = 2T(n/2) + O(n) = O(n log n)', 'Quick Sort: T(n) = T(k) + T(n-k-1) + O(n)'],
    difficulty: 'medium',
    tags: ['sorting', 'algorithms', 'complexity'],
    readTime: 10
  }
];

const videos = [
  {
    subjectName: 'Data Structures',
    topic: 'Trees',
    title: 'AVL Trees - Rotations Explained',
    description: 'Complete guide to AVL tree rotations with animations',
    youtubeId: 'jDM6_TnYIqE',
    duration: '18:32',
    difficulty: 'intermediate',
    timestamps: [
      { time: '0:00', label: 'Introduction to AVL Trees', seconds: 0 },
      { time: '3:20', label: 'Right Rotation', seconds: 200 },
      { time: '7:45', label: 'Left Rotation', seconds: 465 },
      { time: '12:10', label: 'Double Rotations', seconds: 730 },
      { time: '15:30', label: 'Implementation', seconds: 930 }
    ]
  },
  {
    subjectName: 'Operating Systems',
    topic: 'CPU Scheduling',
    title: 'CPU Scheduling Algorithms',
    description: 'FCFS, SJF, Round Robin, Priority Scheduling explained',
    youtubeId: 'EWkQl0n0w5M',
    duration: '22:15',
    difficulty: 'intermediate',
    timestamps: [
      { time: '0:00', label: 'Introduction', seconds: 0 },
      { time: '2:30', label: 'FCFS Algorithm', seconds: 150 },
      { time: '7:00', label: 'SJF Algorithm', seconds: 420 },
      { time: '13:20', label: 'Round Robin', seconds: 800 },
      { time: '18:45', label: 'Priority Scheduling', seconds: 1125 }
    ]
  },
  {
    subjectName: 'DBMS',
    topic: 'SQL',
    title: 'SQL Joins - Complete Tutorial',
    description: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN with examples',
    youtubeId: '9yeOJ0ZMUYw',
    duration: '15:44',
    difficulty: 'beginner',
    timestamps: [
      { time: '0:00', label: 'Introduction to Joins', seconds: 0 },
      { time: '2:00', label: 'INNER JOIN', seconds: 120 },
      { time: '5:30', label: 'LEFT JOIN', seconds: 330 },
      { time: '9:00', label: 'RIGHT JOIN', seconds: 540 },
      { time: '12:20', label: 'FULL OUTER JOIN', seconds: 740 }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Subject.deleteMany({});
    await Note.deleteMany({});
    await Video.deleteMany({});

    await Subject.insertMany(subjects);
    await Note.insertMany(notes);
    await Video.insertMany(videos);

    console.log('✅ Seed data inserted successfully!');
    console.log(`  - ${subjects.length} subjects`);
    console.log(`  - ${notes.length} notes`);
    console.log(`  - ${videos.length} videos`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
