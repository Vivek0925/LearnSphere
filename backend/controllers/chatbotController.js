const pdfParse = require("pdf-parse");
const fs = require("fs");
const PYQ = require("../models/PYQ");
const Subject = require("../models/Subject");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const APP_NAME = process.env.APP_NAME || "LearnSphere";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const MODEL_CANDIDATES = {
  "llama-3.1-8b": [
    "meta-llama/llama-3.1-8b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:latest",
    "meta-llama/llama-3.1-8b-instruct",
  ],
  "llama-3.2-3b": [
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:latest",
    "meta-llama/llama-3.2-3b-instruct",
  ],
  "mistral-7b": [
    "mistral-7b-instruct:latest",
    "mistralai/mistral-7b-instruct:free",
    "mistralai/mistral-7b-instruct",
  ],
  "qwen-2.5-7b": [
    "qwen/qwen-2.5-7b-instruct:free",
    "qwen/qwen-2.5-7b-instruct:latest",
    "qwen/qwen-2.5-7b-instruct",
  ],
};

const DEFAULT_MODEL_KEY = "llama-3.1-8b";

async function callOpenRouter(messages, modelKey) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY missing");
  }

  const candidates = MODEL_CANDIDATES[modelKey] || [modelKey];
  let lastError = null;

  for (const model of candidates) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": APP_URL,
          "X-Title": APP_NAME,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        lastError = new Error(data.error?.message || "OpenRouter error");
        continue;
      }

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty AI response");

      return { text, model };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("No working model found");
}

exports.chat = async (req, res) => {
  try {
    const files = req.files || []; // ✅ MULTIPLE FILES
    const hasPDF = files.length > 0;

    const message = req.body.message || "";
    const subjectId = req.body.subjectId || null;
    const examYear = req.body.examYear || null;
    const examType = req.body.examType || "endterm";
    const modelKey = req.body.model || DEFAULT_MODEL_KEY;

    let combinedText = "";

    // 🔥 MULTI PDF PROCESSING
    if (hasPDF) {
      for (const file of files) {
        try {
          const buffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(buffer);

          if (pdfData.text) {
            combinedText += `\n\n----- ${file.originalname} -----\n\n`;
            combinedText += pdfData.text;
          }
        } catch (err) {
          console.error("PDF read error:", err.message);
        }
      }

      if (!combinedText.trim()) {
        return res.status(400).json({
          message: "PDFs contain no readable text",
        });
      }
    }

    let subjectName = "Engineering";
    let topics = [];

    if (subjectId) {
      try {
        const subject = await Subject.findById(subjectId);
        if (subject) {
          subjectName = subject.name;
          topics = subject.topics.map((t) => t.name);
        }
      } catch (e) {
        console.error("Subject fetch error:", e.message);
      }
    }

    // 🔥 POWERFUL PROMPT
    let userContent = `
You are an expert exam analyzer.

TASK:
- Extract important questions from all papers
- Remove duplicate questions
- Generate at least 15 important questions
- Keep questions exam-focused
- If possible, group by topic

OUTPUT:
- Numbered list (1,2,3...)
- Clean formatting

CONTENT:
${combinedText.slice(0, 12000)}
`;

    if (message) {
      userContent = message + "\n\n" + userContent;
    }

    const messages = [
      {
        role: "system",
        content: "You are LearnSphere AI, expert in analyzing exam papers.",
      },
      {
        role: "user",
        content: userContent,
      },
    ];

    let aiResponse, usedModel;

    try {
      const result = await callOpenRouter(messages, modelKey);
      aiResponse = result.text;
      usedModel = result.model;
    } catch (err) {
      return res.status(500).json({
        message: `AI Error: ${err.message}`,
      });
    }

    // 🔥 SAVE PDFs
    if (hasPDF) {
      for (const file of files) {
        try {
          await PYQ.create({
            subjectId,
            subjectName,
            fileName: file.originalname,
            filePath: file.path,
            examYear: examYear || new Date().getFullYear(),
            examType,
            extractedText: combinedText,
            status: "completed",
          });
        } catch (e) {
          console.error("Mongo save error:", e.message);
        }
      }
    }

    res.json({
      response: aiResponse,
      model: usedModel,
      filesProcessed: files.length,
      timestamp: new Date(),
    });

  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getFreeModels = (req, res) => {
  res.json({
    models: Object.keys(MODEL_CANDIDATES).map((key) => ({
      key,
      label: key,
    })),
    default: DEFAULT_MODEL_KEY,
  });
};