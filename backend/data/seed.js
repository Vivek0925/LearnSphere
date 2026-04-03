const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Subject = require('../models/Subject');


const subjects = [

  // ─── SEM 3 ───────────────────────────────────────────────
  {
    name: 'Principles of Programming Languages', code: 'PPL',
    semester: 3, branch: 'CSE',
    description: 'Study of programming language concepts, paradigms and design principles',
    icon: '🔤', color: '#6366f1', difficulty: 'medium',
    topics: [
      { name: 'Language Paradigms', importanceScore: 85, trend: 'stable', tags: ['OOP', 'functional', 'logic'] },
      { name: 'Syntax & Semantics', importanceScore: 80, trend: 'stable', tags: ['BNF', 'grammar', 'parsing'] },
      { name: 'Scope & Binding', importanceScore: 78, trend: 'stable', tags: ['static', 'dynamic', 'scope'] },
      { name: 'Type Systems', importanceScore: 82, trend: 'rising', tags: ['static typing', 'dynamic typing'] },
      { name: 'Runtime Storage', importanceScore: 75, trend: 'stable', tags: ['stack', 'heap', 'activation record'] },
    ]
  },
  {
    name: 'Operating Systems', code: 'OS',
    semester: 3, branch: 'CSE',
    description: 'Fundamentals of operating system design and implementation',
    icon: '💻', color: '#10b981', difficulty: 'hard',
    topics: [
      { name: 'CPU Scheduling', importanceScore: 90, trend: 'stable', tags: ['FCFS', 'SJF', 'Round Robin'] },
      { name: 'Deadlock', importanceScore: 88, trend: 'rising', tags: ['prevention', 'detection', 'avoidance'] },
      { name: 'Memory Management', importanceScore: 85, trend: 'stable', tags: ['paging', 'segmentation', 'virtual memory'] },
      { name: 'File Systems', importanceScore: 72, trend: 'stable', tags: ['FAT', 'inode', 'disk scheduling'] },
      { name: 'Synchronization', importanceScore: 80, trend: 'rising', tags: ['mutex', 'semaphore', 'monitor'] },
    ]
  },
  {
    name: 'Mathematics III', code: 'M3',
    semester: 3, branch: 'CSE',
    description: 'Engineering mathematics covering transforms, complex analysis and statistics',
    icon: '📐', color: '#f59e0b', difficulty: 'hard',
    topics: [
      { name: 'Laplace Transform', importanceScore: 90, trend: 'stable', tags: ['inverse', 'properties', 'applications'] },
      { name: 'Fourier Series', importanceScore: 85, trend: 'stable', tags: ['half-range', 'Parsevals theorem'] },
      { name: 'Complex Analysis', importanceScore: 80, trend: 'stable', tags: ['Cauchy', 'residues', 'contour'] },
      { name: 'Z-Transform', importanceScore: 78, trend: 'stable', tags: ['inverse Z', 'difference equations'] },
      { name: 'Probability & Statistics', importanceScore: 82, trend: 'rising', tags: ['distributions', 'testing'] },
    ]
  },
  {
    name: 'Digital Electronics & Logic Design', code: 'DELD',
    semester: 3, branch: 'CSE',
    description: 'Boolean algebra, logic gates, combinational and sequential circuits',
    icon: '⚡', color: '#ec4899', difficulty: 'medium',
    topics: [
      { name: 'Boolean Algebra', importanceScore: 85, trend: 'stable', tags: ['K-map', 'minimization', 'SOP'] },
      { name: 'Combinational Circuits', importanceScore: 88, trend: 'stable', tags: ['adder', 'MUX', 'decoder'] },
      { name: 'Sequential Circuits', importanceScore: 90, trend: 'rising', tags: ['flip-flops', 'counters', 'registers'] },
      { name: 'Logic Families', importanceScore: 70, trend: 'stable', tags: ['TTL', 'CMOS', 'ECL'] },
      { name: 'Memory & PLDs', importanceScore: 75, trend: 'stable', tags: ['ROM', 'RAM', 'PLA', 'FPGA'] },
    ]
  },
  {
    name: 'Data Structures & Algorithms', code: 'DSA',
    semester: 3, branch: 'CSE',
    description: 'Core data structures and algorithm design techniques',
    icon: '🌳', color: '#8b5cf6', difficulty: 'hard',
    topics: [
      { name: 'Arrays & Linked Lists', importanceScore: 75, trend: 'stable', tags: ['arrays', 'pointers'] },
      { name: 'Trees & BST', importanceScore: 90, trend: 'rising', tags: ['binary tree', 'BST', 'AVL'] },
      { name: 'Graph Algorithms', importanceScore: 88, trend: 'rising', tags: ['BFS', 'DFS', 'shortest path'] },
      { name: 'Hashing', importanceScore: 80, trend: 'stable', tags: ['hash table', 'collision'] },
      { name: 'Dynamic Programming', importanceScore: 95, trend: 'rising', tags: ['memoization', 'tabulation'] },
    ]
  },

  // ─── SEM 4 ───────────────────────────────────────────────
  {
    name: 'Computer System Architecture', code: 'CSA',
    semester: 4, branch: 'CSE',
    description: 'Computer organization, instruction sets, pipelining and memory hierarchy',
    icon: '🖥️', color: '#3b82f6', difficulty: 'hard',
    topics: [
      { name: 'Instruction Set Architecture', importanceScore: 88, trend: 'stable', tags: ['RISC', 'CISC', 'ISA'] },
      { name: 'Pipelining', importanceScore: 90, trend: 'rising', tags: ['hazards', 'stalls', 'forwarding'] },
      { name: 'Memory Hierarchy', importanceScore: 85, trend: 'stable', tags: ['cache', 'virtual memory', 'TLB'] },
      { name: 'I/O Organization', importanceScore: 72, trend: 'stable', tags: ['DMA', 'interrupts', 'buses'] },
      { name: 'Parallel Processing', importanceScore: 78, trend: 'rising', tags: ['Flynn taxonomy', 'multicore'] },
    ]
  },
  {
    name: 'Design & Analysis of Algorithms', code: 'DAA',
    semester: 4, branch: 'CSE',
    description: 'Algorithm design paradigms, complexity analysis and NP theory',
    icon: '⚡', color: '#f59e0b', difficulty: 'hard',
    topics: [
      { name: 'Asymptotic Analysis', importanceScore: 90, trend: 'stable', tags: ['Big-O', 'theta', 'omega'] },
      { name: 'Divide & Conquer', importanceScore: 85, trend: 'stable', tags: ['merge sort', 'quick sort', 'binary search'] },
      { name: 'Greedy Algorithms', importanceScore: 82, trend: 'stable', tags: ['Kruskal', 'Prim', 'Huffman'] },
      { name: 'Dynamic Programming', importanceScore: 92, trend: 'rising', tags: ['LCS', 'knapsack', 'matrix chain'] },
      { name: 'NP Completeness', importanceScore: 78, trend: 'stable', tags: ['P vs NP', 'reduction', 'NP-hard'] },
    ]
  },
  {
    name: 'Database Management Systems', code: 'DBMS',
    semester: 4, branch: 'CSE',
    description: 'Database design, SQL, transactions and query optimization',
    icon: '🗄️', color: '#6366f1', difficulty: 'medium',
    topics: [
      { name: 'ER Model', importanceScore: 80, trend: 'stable', tags: ['entity', 'relationship', 'cardinality'] },
      { name: 'Normalization', importanceScore: 92, trend: 'rising', tags: ['1NF', '2NF', '3NF', 'BCNF'] },
      { name: 'SQL', importanceScore: 95, trend: 'rising', tags: ['joins', 'subqueries', 'aggregation'] },
      { name: 'Transactions & ACID', importanceScore: 85, trend: 'stable', tags: ['concurrency', 'locking', 'MVCC'] },
      { name: 'Indexing & Hashing', importanceScore: 78, trend: 'stable', tags: ['B-tree', 'hash index', 'query plan'] },
    ]
  },
  {
    name: 'Discrete Mathematics', code: 'DM',
    semester: 4, branch: 'CSE',
    description: 'Mathematical foundations of computer science — logic, sets, graphs and combinatorics',
    icon: '∑', color: '#10b981', difficulty: 'medium',
    topics: [
      { name: 'Mathematical Logic', importanceScore: 85, trend: 'stable', tags: ['propositional', 'predicate', 'proofs'] },
      { name: 'Set Theory & Relations', importanceScore: 80, trend: 'stable', tags: ['sets', 'functions', 'relations'] },
      { name: 'Graph Theory', importanceScore: 88, trend: 'rising', tags: ['trees', 'Euler', 'Hamilton', 'coloring'] },
      { name: 'Combinatorics', importanceScore: 82, trend: 'stable', tags: ['permutations', 'combinations', 'pigeonhole'] },
      { name: 'Algebraic Structures', importanceScore: 75, trend: 'stable', tags: ['groups', 'rings', 'lattices'] },
    ]
  },
  {
    name: 'Java & OOP', code: 'JAVA',
    semester: 4, branch: 'CSE',
    description: 'Object-oriented programming with Java — classes, inheritance, collections and frameworks',
    icon: '☕', color: '#ec4899', difficulty: 'medium',
    topics: [
      { name: 'OOP Concepts', importanceScore: 88, trend: 'stable', tags: ['encapsulation', 'inheritance', 'polymorphism'] },
      { name: 'Exception Handling', importanceScore: 82, trend: 'stable', tags: ['try-catch', 'custom exceptions'] },
      { name: 'Collections Framework', importanceScore: 85, trend: 'rising', tags: ['List', 'Map', 'Set', 'Iterator'] },
      { name: 'Multithreading', importanceScore: 80, trend: 'rising', tags: ['threads', 'synchronization', 'executor'] },
      { name: 'Java I/O & Streams', importanceScore: 75, trend: 'stable', tags: ['streams', 'lambda', 'file I/O'] },
    ]
  },

  // ─── SEM 5 ───────────────────────────────────────────────
  {
    name: 'Computer Graphics', code: 'CG',
    semester: 5, branch: 'CSE',
    description: '2D/3D rendering, transformations, clipping and rasterization algorithms',
    icon: '🎨', color: '#8b5cf6', difficulty: 'medium',
    topics: [
      { name: 'Rasterization Algorithms', importanceScore: 85, trend: 'stable', tags: ['Bresenham', 'DDA', 'scan fill'] },
      { name: '2D Transformations', importanceScore: 88, trend: 'stable', tags: ['translation', 'rotation', 'scaling'] },
      { name: '3D Transformations', importanceScore: 82, trend: 'rising', tags: ['projection', 'viewing pipeline'] },
      { name: 'Clipping', importanceScore: 78, trend: 'stable', tags: ['Cohen-Sutherland', 'Cyrus-Beck'] },
      { name: 'Curves & Surfaces', importanceScore: 75, trend: 'stable', tags: ['Bezier', 'B-spline', 'NURBS'] },
    ]
  },
  {
    name: 'Computer Networks', code: 'CN',
    semester: 5, branch: 'CSE',
    description: 'Network protocols, OSI/TCP-IP model, routing and application layer',
    icon: '🌐', color: '#3b82f6', difficulty: 'medium',
    topics: [
      { name: 'OSI & TCP/IP Model', importanceScore: 90, trend: 'stable', tags: ['layers', 'protocols', 'encapsulation'] },
      { name: 'IP Addressing & Subnetting', importanceScore: 88, trend: 'stable', tags: ['IPv4', 'IPv6', 'CIDR'] },
      { name: 'Routing Protocols', importanceScore: 82, trend: 'stable', tags: ['RIP', 'OSPF', 'BGP'] },
      { name: 'Transport Layer', importanceScore: 85, trend: 'rising', tags: ['TCP', 'UDP', 'congestion control'] },
      { name: 'Application Layer', importanceScore: 78, trend: 'rising', tags: ['HTTP', 'DNS', 'FTP', 'SMTP'] },
    ]
  },
  {
    name: 'Data Analytics with Python', code: 'DAP',
    semester: 5, branch: 'CSE',
    description: 'Python for data analysis — NumPy, Pandas, visualization and statistics',
    icon: '🐍', color: '#10b981', difficulty: 'easy',
    topics: [
      { name: 'Python Fundamentals', importanceScore: 80, trend: 'stable', tags: ['lists', 'dicts', 'comprehensions'] },
      { name: 'NumPy & Pandas', importanceScore: 90, trend: 'rising', tags: ['DataFrame', 'arrays', 'operations'] },
      { name: 'Data Visualization', importanceScore: 85, trend: 'rising', tags: ['Matplotlib', 'Seaborn', 'Plotly'] },
      { name: 'Statistical Analysis', importanceScore: 82, trend: 'stable', tags: ['hypothesis testing', 'regression'] },
      { name: 'Data Cleaning', importanceScore: 78, trend: 'stable', tags: ['missing values', 'outliers', 'encoding'] },
    ]
  },
  {
    name: 'Formal Languages & Automata Theory', code: 'FLAT',
    semester: 5, branch: 'CSE',
    description: 'Automata, formal grammars, Turing machines and computability',
    icon: '🤖', color: '#f59e0b', difficulty: 'hard',
    topics: [
      { name: 'Finite Automata', importanceScore: 88, trend: 'stable', tags: ['DFA', 'NFA', 'epsilon-NFA'] },
      { name: 'Regular Languages', importanceScore: 85, trend: 'stable', tags: ['regex', 'pumping lemma', 'closure'] },
      { name: 'Context Free Grammars', importanceScore: 90, trend: 'rising', tags: ['CFG', 'parse tree', 'ambiguity'] },
      { name: 'Pushdown Automata', importanceScore: 82, trend: 'stable', tags: ['PDA', 'CFL', 'NPDA'] },
      { name: 'Turing Machines', importanceScore: 85, trend: 'stable', tags: ['decidability', 'halting problem', 'complexity'] },
    ]
  },
  {
    name: 'Microprocessor & Interfacing', code: 'MP',
    semester: 5, branch: 'CSE',
    description: '8085/8086 architecture, assembly programming and peripheral interfacing',
    icon: '🔧', color: '#ec4899', difficulty: 'hard',
    topics: [
      { name: '8085 Architecture', importanceScore: 85, trend: 'stable', tags: ['registers', 'ALU', 'bus structure'] },
      { name: '8086 Architecture', importanceScore: 88, trend: 'stable', tags: ['segmentation', 'addressing modes'] },
      { name: 'Assembly Programming', importanceScore: 90, trend: 'stable', tags: ['instructions', 'interrupts', 'programs'] },
      { name: 'Memory Interfacing', importanceScore: 78, trend: 'stable', tags: ['RAM', 'ROM', 'address decoding'] },
      { name: 'I/O Interfacing', importanceScore: 80, trend: 'stable', tags: ['8255', '8253', 'ADC', 'DAC'] },
    ]
  },

  // ─── SEM 6 ───────────────────────────────────────────────
  {
    name: 'AI & Expert Systems', code: 'AIES',
    semester: 6, branch: 'CSE',
    description: 'Artificial intelligence fundamentals, search, knowledge representation and expert systems',
    icon: '🧠', color: '#6366f1', difficulty: 'hard',
    topics: [
      { name: 'Search Algorithms', importanceScore: 88, trend: 'stable', tags: ['BFS', 'DFS', 'A*', 'heuristics'] },
      { name: 'Knowledge Representation', importanceScore: 85, trend: 'stable', tags: ['logic', 'semantic nets', 'frames'] },
      { name: 'Expert Systems', importanceScore: 80, trend: 'stable', tags: ['inference engine', 'rule base', 'MYCIN'] },
      { name: 'Planning & Uncertainty', importanceScore: 78, trend: 'rising', tags: ['STRIPS', 'Bayesian', 'fuzzy logic'] },
      { name: 'Natural Language Processing Basics', importanceScore: 82, trend: 'rising', tags: ['parsing', 'semantics'] },
    ]
  },
  {
    name: 'Cryptography & Network Security', code: 'CNS',
    semester: 6, branch: 'CSE',
    description: 'Encryption algorithms, PKI, network attacks and security protocols',
    icon: '🔐', color: '#ec4899', difficulty: 'hard',
    topics: [
      { name: 'Symmetric Cryptography', importanceScore: 90, trend: 'stable', tags: ['AES', 'DES', '3DES', 'modes'] },
      { name: 'Asymmetric Cryptography', importanceScore: 88, trend: 'rising', tags: ['RSA', 'ECC', 'Diffie-Hellman'] },
      { name: 'Hash Functions & Digital Signatures', importanceScore: 85, trend: 'stable', tags: ['SHA', 'MD5', 'PKI'] },
      { name: 'Network Attacks & Defenses', importanceScore: 82, trend: 'rising', tags: ['DoS', 'MITM', 'firewalls', 'IDS'] },
      { name: 'Security Protocols', importanceScore: 80, trend: 'rising', tags: ['SSL/TLS', 'IPSec', 'SSH', 'PGP'] },
    ]
  },
  {
    name: 'Compiler Design', code: 'CD',
    semester: 6, branch: 'CSE',
    description: 'Lexical analysis, parsing, semantic analysis, optimization and code generation',
    icon: '⚙️', color: '#10b981', difficulty: 'hard',
    topics: [
      { name: 'Lexical Analysis', importanceScore: 85, trend: 'stable', tags: ['tokens', 'regex', 'LEX'] },
      { name: 'Parsing Techniques', importanceScore: 90, trend: 'stable', tags: ['LL', 'LR', 'YACC', 'parse table'] },
      { name: 'Semantic Analysis', importanceScore: 82, trend: 'stable', tags: ['type checking', 'symbol table', 'SDT'] },
      { name: 'Intermediate Code Generation', importanceScore: 80, trend: 'stable', tags: ['TAC', 'quadruples', 'DAG'] },
      { name: 'Code Optimization & Generation', importanceScore: 85, trend: 'rising', tags: ['peephole', 'register allocation'] },
    ]
  },
  {
    name: 'Internet of Things', code: 'IOT',
    semester: 6, branch: 'CSE',
    description: 'IoT architecture, sensors, protocols, cloud integration and smart systems',
    icon: '📡', color: '#f59e0b', difficulty: 'medium',
    topics: [
      { name: 'IoT Architecture', importanceScore: 85, trend: 'rising', tags: ['layers', 'edge', 'fog', 'cloud'] },
      { name: 'Sensors & Actuators', importanceScore: 80, trend: 'stable', tags: ['types', 'interfacing', 'Arduino'] },
      { name: 'IoT Protocols', importanceScore: 88, trend: 'rising', tags: ['MQTT', 'CoAP', 'HTTP', 'Zigbee'] },
      { name: 'IoT Security', importanceScore: 82, trend: 'rising', tags: ['authentication', 'encryption', 'threats'] },
      { name: 'IoT Applications', importanceScore: 78, trend: 'rising', tags: ['smart home', 'healthcare', 'industrial'] },
    ]
  },
  {
    name: 'Software Engineering & Project Mgmt', code: 'SEPM',
    semester: 6, branch: 'CSE',
    description: 'SDLC models, agile, UML, testing strategies and project management',
    icon: '📋', color: '#8b5cf6', difficulty: 'easy',
    topics: [
      { name: 'SDLC Models', importanceScore: 85, trend: 'stable', tags: ['waterfall', 'agile', 'spiral', 'scrum'] },
      { name: 'Requirements Engineering', importanceScore: 80, trend: 'stable', tags: ['SRS', 'use cases', 'user stories'] },
      { name: 'UML & Design', importanceScore: 82, trend: 'stable', tags: ['class diagram', 'sequence', 'ER'] },
      { name: 'Software Testing', importanceScore: 88, trend: 'rising', tags: ['unit', 'integration', 'black-box', 'white-box'] },
      { name: 'Project Management', importanceScore: 78, trend: 'stable', tags: ['estimation', 'scheduling', 'risk', 'COCOMO'] },
    ]
  },

  // ─── SEM 7 ───────────────────────────────────────────────
  {
    name: 'Big Data & Hadoop', code: 'BDH',
    semester: 7, branch: 'CSE',
    description: 'Hadoop ecosystem, MapReduce, Spark and large-scale data processing',
    icon: '🐘', color: '#f59e0b', difficulty: 'hard',
    topics: [
      { name: 'Hadoop Architecture', importanceScore: 88, trend: 'rising', tags: ['HDFS', 'NameNode', 'DataNode'] },
      { name: 'MapReduce', importanceScore: 90, trend: 'stable', tags: ['mapper', 'reducer', 'combiner', 'partitioner'] },
      { name: 'Apache Spark', importanceScore: 92, trend: 'rising', tags: ['RDD', 'DataFrame', 'Spark SQL', 'MLlib'] },
      { name: 'Hive & Pig', importanceScore: 78, trend: 'stable', tags: ['HiveQL', 'Pig Latin', 'data warehouse'] },
      { name: 'NoSQL Databases', importanceScore: 82, trend: 'rising', tags: ['MongoDB', 'Cassandra', 'HBase'] },
    ]
  },
  {
    name: 'Data Mining & Warehousing', code: 'DMW',
    semester: 7, branch: 'CSE',
    description: 'Data warehouse design, OLAP, mining techniques and pattern discovery',
    icon: '⛏️', color: '#3b82f6', difficulty: 'medium',
    topics: [
      { name: 'Data Warehouse Architecture', importanceScore: 85, trend: 'stable', tags: ['star schema', 'snowflake', 'fact table'] },
      { name: 'OLAP Operations', importanceScore: 82, trend: 'stable', tags: ['slice', 'dice', 'drill-down', 'roll-up'] },
      { name: 'Classification', importanceScore: 90, trend: 'rising', tags: ['decision tree', 'naive Bayes', 'SVM', 'kNN'] },
      { name: 'Clustering', importanceScore: 85, trend: 'rising', tags: ['k-means', 'hierarchical', 'DBSCAN'] },
      { name: 'Association Rules', importanceScore: 80, trend: 'stable', tags: ['Apriori', 'FP-growth', 'support', 'confidence'] },
    ]
  },
  {
    name: 'Cyber Technology', code: 'CT',
    semester: 7, branch: 'CSE',
    description: 'Cybersecurity frameworks, ethical hacking, forensics and threat intelligence',
    icon: '🛡️', color: '#ec4899', difficulty: 'medium',
    topics: [
      { name: 'Ethical Hacking', importanceScore: 88, trend: 'rising', tags: ['penetration testing', 'reconnaissance', 'exploitation'] },
      { name: 'Vulnerability Assessment', importanceScore: 85, trend: 'rising', tags: ['OWASP', 'CVE', 'scanning tools'] },
      { name: 'Digital Forensics', importanceScore: 80, trend: 'rising', tags: ['evidence collection', 'analysis', 'chain of custody'] },
      { name: 'Malware Analysis', importanceScore: 82, trend: 'rising', tags: ['static analysis', 'dynamic analysis', 'reverse engineering'] },
      { name: 'Security Frameworks', importanceScore: 78, trend: 'stable', tags: ['NIST', 'ISO 27001', 'SOC'] },
    ]
  },
  {
    name: 'Internet & Web Technologies', code: 'IWT',
    semester: 7, branch: 'CSE',
    description: 'Full stack web development — HTML/CSS, JavaScript, REST APIs and modern frameworks',
    icon: '🌍', color: '#10b981', difficulty: 'easy',
    topics: [
      { name: 'HTML5 & CSS3', importanceScore: 80, trend: 'stable', tags: ['semantic HTML', 'flexbox', 'grid', 'responsive'] },
      { name: 'JavaScript & DOM', importanceScore: 88, trend: 'rising', tags: ['ES6+', 'async/await', 'fetch', 'events'] },
      { name: 'React / Frontend Frameworks', importanceScore: 90, trend: 'rising', tags: ['components', 'hooks', 'state', 'routing'] },
      { name: 'REST APIs & Node.js', importanceScore: 85, trend: 'rising', tags: ['Express', 'REST', 'JWT', 'middleware'] },
      { name: 'Databases & Deployment', importanceScore: 78, trend: 'rising', tags: ['MongoDB', 'SQL', 'Docker', 'cloud'] },
    ]
  },
  {
    name: 'Machine Learning', code: 'ML',
    semester: 7, branch: 'CSE',
    description: 'Supervised/unsupervised learning, model evaluation and scikit-learn',
    icon: '🤖', color: '#6366f1', difficulty: 'hard',
    topics: [
      { name: 'Supervised Learning', importanceScore: 92, trend: 'rising', tags: ['regression', 'classification', 'SVM', 'decision trees'] },
      { name: 'Unsupervised Learning', importanceScore: 85, trend: 'rising', tags: ['clustering', 'PCA', 'dimensionality reduction'] },
      { name: 'Model Evaluation', importanceScore: 88, trend: 'stable', tags: ['cross-validation', 'ROC', 'precision', 'recall'] },
      { name: 'Ensemble Methods', importanceScore: 82, trend: 'rising', tags: ['random forest', 'boosting', 'bagging'] },
      { name: 'Feature Engineering', importanceScore: 80, trend: 'rising', tags: ['selection', 'extraction', 'normalization'] },
    ]
  },
  {
    name: 'Neural Networks & Deep Learning', code: 'NNDL',
    semester: 7, branch: 'CSE',
    description: 'Neural network architectures, backpropagation, CNNs, RNNs and transformers',
    icon: '🧬', color: '#8b5cf6', difficulty: 'hard',
    topics: [
      { name: 'Neural Network Basics', importanceScore: 88, trend: 'rising', tags: ['perceptron', 'activation functions', 'backprop'] },
      { name: 'CNN', importanceScore: 92, trend: 'rising', tags: ['convolution', 'pooling', 'ResNet', 'VGG'] },
      { name: 'RNN & LSTM', importanceScore: 88, trend: 'rising', tags: ['sequence models', 'vanishing gradient', 'attention'] },
      { name: 'Transformers', importanceScore: 90, trend: 'rising', tags: ['self-attention', 'BERT', 'GPT'] },
      { name: 'Training & Optimization', importanceScore: 85, trend: 'stable', tags: ['Adam', 'dropout', 'batch norm', 'regularization'] },
    ]
  },

  // ─── SEM 8 ───────────────────────────────────────────────
  {
    name: 'Cyber Law & Intellectual Property', code: 'CLIP',
    semester: 8, branch: 'CSE',
    description: 'IT Act, cybercrime, IPR, patents and digital rights management',
    icon: '⚖️', color: '#f59e0b', difficulty: 'easy',
    topics: [
      { name: 'IT Act 2000 & Amendments', importanceScore: 88, trend: 'stable', tags: ['offences', 'penalties', 'sections'] },
      { name: 'Cybercrime Types', importanceScore: 85, trend: 'rising', tags: ['hacking', 'identity theft', 'phishing'] },
      { name: 'Intellectual Property Rights', importanceScore: 82, trend: 'stable', tags: ['copyright', 'trademark', 'patent'] },
      { name: 'Digital Contracts & Evidence', importanceScore: 78, trend: 'stable', tags: ['e-contracts', 'digital signatures', 'admissibility'] },
      { name: 'Privacy & Data Protection', importanceScore: 85, trend: 'rising', tags: ['GDPR', 'data localization', 'consent'] },
    ]
  },
  {
    name: 'Mobile & Cloud Computing', code: 'MCV',
    semester: 8, branch: 'CSE',
    description: 'Cloud service models, virtualization, mobile app development and deployment',
    icon: '☁️', color: '#3b82f6', difficulty: 'medium',
    topics: [
      { name: 'Cloud Service Models', importanceScore: 90, trend: 'rising', tags: ['IaaS', 'PaaS', 'SaaS', 'serverless'] },
      { name: 'Virtualization', importanceScore: 85, trend: 'stable', tags: ['hypervisor', 'containers', 'Docker', 'Kubernetes'] },
      { name: 'Cloud Platforms', importanceScore: 88, trend: 'rising', tags: ['AWS', 'Azure', 'GCP', 'deployment'] },
      { name: 'Mobile App Development', importanceScore: 82, trend: 'rising', tags: ['Android', 'React Native', 'Flutter'] },
      { name: 'Mobile Security & APIs', importanceScore: 78, trend: 'rising', tags: ['OAuth', 'REST', 'mobile threats'] },
    ]
  },
  {
    name: 'Natural Language Processing', code: 'NLP',
    semester: 8, branch: 'CSE',
    description: 'Text processing, language models, sentiment analysis and transformers',
    icon: '💬', color: '#ec4899', difficulty: 'hard',
    topics: [
      { name: 'Text Preprocessing', importanceScore: 85, trend: 'stable', tags: ['tokenization', 'stemming', 'lemmatization', 'stopwords'] },
      { name: 'Language Models', importanceScore: 92, trend: 'rising', tags: ['n-gram', 'word2vec', 'BERT', 'GPT'] },
      { name: 'Sentiment Analysis', importanceScore: 88, trend: 'rising', tags: ['classification', 'opinion mining', 'VADER'] },
      { name: 'Named Entity Recognition', importanceScore: 82, trend: 'rising', tags: ['NER', 'POS tagging', 'chunking'] },
      { name: 'Machine Translation', importanceScore: 80, trend: 'rising', tags: ['seq2seq', 'attention', 'transformer'] },
    ]
  },
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

    await Subject.insertMany(subjects);

    console.log('✅ Seed data inserted successfully!');
    console.log(`  - ${subjects.length} subjects`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
