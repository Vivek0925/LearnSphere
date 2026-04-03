const pdfParse = require('pdf-parse');
const fs = require('fs');
const PYQ = require('../models/PYQ');
const Subject = require('../models/Subject');

exports.chat = async (req, res) => {
  try {
    const { message, history = [], subjectId, examYear, examType } = req.body;
    const hasPDF = !!req.file;

    const systemPrompt = `You are LearnSphere AI, an expert engineering tutor and exam analyzer for CSE students.

You can:
- Answer questions about Data Structures, Algorithms, OS, DBMS, Networks, Software Engineering and all CSE subjects
- Analyze uploaded PYQ (Previous Year Question) papers and identify important topics
- Detect repeated questions across multiple exam papers
- Predict which topics are likely to appear in upcoming exams
- Give study recommendations based on PYQ patterns

When analyzing a PYQ paper:
- List all extracted questions clearly
- Group by topic and score importance as: Very Important / Important / Normal
- Flag any questions that seem repeated from common exam patterns
- Give a prediction of topics likely coming in next exam
- Be specific and actionable`;

    let userContent = message || '';
    let pdfText = '';
    let analysisResult = null;

    // ── If PDF uploaded ──────────────────────────────────────────────────────
    if (hasPDF) {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        pdfText = pdfData.text?.trim() || '';
      } catch (e) {
        return res.status(400).json({ message: 'Could not read PDF. Make sure it is a valid text-based PDF.' });
      }

      if (!pdfText) {
        return res.status(400).json({ message: 'PDF appears to be scanned/image-based. Please upload a text-based PDF.' });
      }

      // Get subject info if provided
      let subjectName = 'Engineering';
      let semester = '';
      let topics = [];
      let previousPYQs = [];

      if (subjectId) {
        const subject = await Subject.findById(subjectId);
        if (subject) {
          subjectName = subject.name;
          semester = subject.semester;
          topics = subject.topics.map(t => t.name);
          previousPYQs = await PYQ.find({ subjectId }).sort({ examYear: -1 }).limit(4);
        }
      }

      const previousQs = previousPYQs
        .flatMap(p => p.questions.map(q => `[${p.examYear}] ${q.text}`))
        .join('\n') || 'None yet';

      const topicList = topics.length > 0
        ? topics.join(', ')
        : 'Identify topics from the paper itself';

      userContent = `${message ? message + '\n\n' : ''}Please analyze this PYQ paper.

Subject: ${subjectName} ${semester ? `(Sem ${semester})` : ''}
Known Topics: ${topicList}
Exam Year: ${examYear || 'Unknown'}
Exam Type: ${examType || 'End Term'}

Previous Year Questions (for repeat detection):
${previousQs}

--- EXAM PAPER TEXT ---
${pdfText.slice(0, 4000)}
--- END ---

Analyze and provide:
1. All extracted questions with topic mapping
2. Topic importance (Very Important / Important / Normal) with reason
3. Repeated questions (if any match previous years)
4. Top 3 predicted topics for next exam
5. One-line overall paper insight`;

      // Save to MongoDB in background
      savePYQToMongo({
        subjectId, subjectName, examYear, examType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        extractedText: pdfText,
        uploadedBy: req.user?._id
      });
    }

    // ── Call OpenRouter ──────────────────────────────────────────────────────
    const messages = [
      ...history.slice(-10),
      { role: 'user', content: userContent }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'LearnSphere AI Tutor'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({
        message: 'AI service error',
        error: err.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, could not generate a response.';

    res.json({
      response: aiResponse,
      model: data.model,
      wasPDF: hasPDF,
      fileName: req.file?.originalname || null,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Save PYQ to MongoDB (fire and forget, doesn't block response)
async function savePYQToMongo({ subjectId, subjectName, examYear, examType, fileName, filePath, extractedText, uploadedBy }) {
  try {
    if (!subjectId || !subjectName) return;
    await PYQ.create({
      subjectId, subjectName, uploadedBy,
      fileName, filePath,
      examYear: parseInt(examYear) || new Date().getFullYear(),
      examType: examType || 'endterm',
      extractedText,
      questions: [],
      topicAnalysis: [],
      status: 'completed'
    });
  } catch (e) {
    console.error('PYQ save error:', e.message);
  }
}