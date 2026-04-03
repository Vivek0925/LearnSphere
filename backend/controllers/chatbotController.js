const pdfParse = require("pdf-parse");
const fs = require("fs");
const PYQ = require("../models/PYQ");
const Subject = require("../models/Subject");

// ── Gemini API call ───────────────────────────────────────────────────────────
async function callGemini(messages) {
  const systemMsg = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  const geminiMessages = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemMsg
          ? { parts: [{ text: systemMsg.content }] }
          : undefined,
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.4
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini error:", data);
    throw new Error(data.error?.message || "Gemini API error");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return { text, model: "gemini-1.5-flash" };
}

// ── Main chat handler ─────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const hasPDF = !!req.file;

    // Parse body safely (FormData sends everything as strings)
    const message = req.body.message || "";
    const subjectId = req.body.subjectId || null;
    const examYear = req.body.examYear || null;
    const examType = req.body.examType || "endterm";

    let history = [];
    try {
      const raw = req.body.history;
      if (raw) history = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch { history = []; }

    let subjectName = "Engineering";
    let semester = "";
    let topics = [];
    let previousPYQs = [];

    // ── System prompt ─────────────────────────────────────────────────────
    const systemPrompt = `You are LearnSphere AI, an expert engineering tutor and exam analyzer for CSE students.

You can:
- Answer questions about Data Structures, Algorithms, OS, DBMS, Networks, Software Engineering and all CSE subjects
- Analyze uploaded PYQ (Previous Year Question) papers and identify important topics
- Detect repeated questions across multiple exam papers
- Predict which topics are likely to appear in upcoming exams
- Give study recommendations based on PYQ patterns

When analyzing a PYQ paper:
- List all extracted questions clearly numbered
- Group by topic and score importance as: Very Important / Important / Normal
- Flag any questions that seem repeated from common exam patterns
- Give top 3 predicted topics for next exam
- Be specific and actionable`;

    let userContent = message;

    // ── If PDF uploaded ───────────────────────────────────────────────────
    if (hasPDF) {
      let pdfText = "";
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        pdfText = pdfData.text?.trim() || "";
      } catch (e) {
        return res.status(400).json({
          message: "Could not read PDF. Make sure it is a valid text-based PDF."
        });
      }

      if (!pdfText) {
        return res.status(400).json({
          message: "PDF appears to be scanned/image-based. Please upload a text-based PDF."
        });
      }

      if (subjectId) {
        try {
          const subject = await Subject.findById(subjectId);
          if (subject) {
            subjectName = subject.name;
            semester = subject.semester;
            topics = subject.topics.map(t => t.name);
            previousPYQs = await PYQ.find({ subjectId })
              .sort({ examYear: -1 })
              .limit(4);
          }
        } catch (e) {
          console.error("Subject fetch error:", e.message);
        }
      }

      const previousQs = previousPYQs.length > 0
        ? previousPYQs
            .flatMap(p => p.questions.map(q => `[${p.examYear}] ${q.text}`))
            .join("\n")
        : "None yet — this is the first paper uploaded for this subject";

      const topicList = topics.length > 0
        ? topics.join(", ")
        : "Identify topics from the paper content itself";

      userContent = `${message ? message + "\n\n" : ""}Analyze this PYQ exam paper:

Subject: ${subjectName}${semester ? ` (CSE Sem ${semester})` : ""}
Known Syllabus Topics: ${topicList}
Exam Year: ${examYear || "Unknown"}
Exam Type: ${examType}

Previous Year Questions for repeat detection:
${previousQs}

--- EXAM PAPER TEXT START ---
${pdfText.slice(0, 4000)}
--- EXAM PAPER TEXT END ---

Please provide:
1. All extracted questions with topic mapping
2. Topic importance (Very Important / Important / Normal) with reason
3. Repeated questions if any match previous years
4. Top 3 predicted topics for next exam
5. One-line overall paper insight`;

      // Save to MongoDB in background
      savePYQToMongo({
        subjectId,
        subjectName,
        examYear,
        examType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        extractedText: pdfText,
      }).catch(e => console.error("PYQ background save failed:", e.message));
    }

    // ── Guard: empty message ──────────────────────────────────────────────
    if (!userContent.trim()) {
      return res.status(400).json({
        message: "Please enter a message or attach a PDF."
      });
    }

    // ── Build messages array ──────────────────────────────────────────────
    const allMessages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []).slice(-10),
      { role: "user", content: userContent }
    ];

    // ── Call Gemini ───────────────────────────────────────────────────────
    let aiResponse, usedModel;
    try {
      const result = await callGemini(allMessages);
      aiResponse = result.text;
      usedModel = result.model;
      console.log("✅ Gemini response received");
    } catch (err) {
      console.error("Gemini failed:", err.message);
      return res.status(500).json({
        message: `AI Error: ${err.message}. Make sure GEMINI_API_KEY is set in .env`
      });
    }

    res.json({
      response: aiResponse,
      model: usedModel,
      wasPDF: hasPDF,
      fileName: req.file?.originalname || null,
      timestamp: new Date()
    });

  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Save PYQ to MongoDB (background, non-blocking) ────────────────────────────
async function savePYQToMongo({
  subjectId, subjectName, examYear, examType,
  fileName, filePath, extractedText
}) {
  if (!subjectId || !subjectName) return;
  await PYQ.create({
    subjectId,
    subjectName,
    fileName,
    filePath,
    examYear: parseInt(examYear) || new Date().getFullYear(),
    examType: examType || "endterm",
    extractedText,
    questions: [],
    topicAnalysis: [],
    status: "completed"
  });
}