const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { exec } = require("child_process");
const util = require("util");
const axios = require("axios");

const execPromise = util.promisify(exec);

// ================= OPENROUTER CONFIG =================
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ================= MODEL =================
const MODEL = "meta-llama/llama-3.1-8b-instruct"; // ✅ BEST
// const MODEL = "meta-llama/llama-3.2-3b-instruct:free";
// const MODEL = "qwen/qwen2.5-7b-instruct:free";

const MODEL_MAP = {
  "llama-3.1-8b": "meta-llama/llama-3.1-8b-instruct",
  "llama-3.2-3b": "meta-llama/llama-3.2-3b-instruct:free",
  "mistral-7b": "mistralai/mistral-7b-instruct:free",
  "qwen-2.5-7b": "qwen/qwen2.5-7b-instruct:free",
};

function toTitleCase(text) {
  return String(text || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferSubject(fileName = "") {
  const base = path.basename(fileName, path.extname(fileName));
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\b(mid|midterm|end|endterm|semester|sem|final|exam|paper|pyq)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned ? toTitleCase(cleaned) : "General";
}

function inferYear(text = "") {
  const matches = String(text).match(/\b(19|20)\d{2}\b/g);
  if (!matches?.length) return new Date().getFullYear();
  return Number(matches[matches.length - 1]);
}

function inferExamType(text = "") {
  return /\b(mid|midterm)\b/i.test(text) ? "midterm" : "endterm";
}

function uniqueList(items) {
  return [...new Set(items.map((i) => String(i || "").trim()).filter(Boolean))];
}

function extractQuestions(aiResponse = "") {
  const lines = String(aiResponse).split("\n");

  const numbered = lines
    .map((line) => line.trim())
    .filter((line) => /^(\d+\.|\d+\)|[-*•])\s+/.test(line))
    .map((line) => line.replace(/^(\d+\.|\d+\)|[-*•])\s+/, ""))
    .filter((line) => line.length > 10);

  if (numbered.length) return uniqueList(numbered).slice(0, 30);

  const sentenceFallback = String(aiResponse)
    .split(/[\n\.]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20)
    .slice(0, 20);

  return uniqueList(sentenceFallback);
}

function extractTopics(aiResponse = "", questions = []) {
  const topicLines = String(aiResponse)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^unit\s*\d+/i.test(line) || /^topic[:\s]/i.test(line) || /^##+\s+/.test(line))
    .map((line) => line.replace(/^##+\s+/, "").replace(/^topic[:\s]*/i, "").replace(/^unit\s*\d+\s*[:.-]?\s*/i, "").trim())
    .filter(Boolean);

  if (topicLines.length) return uniqueList(topicLines).slice(0, 15);

  const questionTopics = questions
    .map((q) => {
      const part = q.split(/[?.:,-]/)[0]?.trim();
      return part && part.length <= 50 ? part : "";
    })
    .filter(Boolean)
    .slice(0, 10);

  return uniqueList(questionTopics).length ? uniqueList(questionTopics) : ["General"];
}

// ================= PDF TEXT EXTRACTION =================
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    if (data.text && data.text.trim().length > 100) {
      return data.text;
    }

    // 🔥 OCR fallback
    console.log("⚠️ Using OCR via Poppler...");

    const outputPrefix = filePath.replace(".pdf", "");

    await execPromise(`pdftoppm -png "${filePath}" "${outputPrefix}"`);

    const dir = path.dirname(filePath);
    const files = fs.readdirSync(dir);

    let fullText = "";

    for (const file of files) {
      if (
        file.startsWith(path.basename(outputPrefix)) &&
        file.endsWith(".png")
      ) {
        const imgPath = path.join(dir, file);
        console.log("🖼 OCR on:", imgPath);

        const {
          data: { text },
        } = await Tesseract.recognize(imgPath, "eng");

        fullText += text + "\n";
      }
    }

    console.log("📏 OCR Total Length:", fullText.length);

    return fullText;
  } catch (err) {
    console.error("❌ PDF extraction error:", err.message);
    return "";
  }
}

// ================= OPENROUTER CALL =================
async function callOpenRouter(messages, modelKey) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("Missing OpenRouter API Key");
  }

  try {
    const resolvedModel = MODEL_MAP[modelKey] || MODEL;

    console.log("🚀 Sending to AI...");

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: resolvedModel,
        messages,
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;

    console.log("✅ AI Response received");

    return text || "No response from AI";
  } catch (err) {
    console.error(
      "❌ OpenRouter error:",
      err.response?.data || err.message
    );
    throw new Error("AI request failed");
  }
}

// ================= MAIN CONTROLLER =================
exports.chat = async (req, res) => {
  try {
    console.log("🔥 CHAT API HIT");

    const files = req.files || [];
    const message = (req.body?.message || "").trim();
    const model = req.body?.model;

    let parsedHistory = [];
    if (req.body?.history) {
      try {
        const history = JSON.parse(req.body.history);
        if (Array.isArray(history)) {
          parsedHistory = history
            .filter(
              (m) =>
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string" &&
                m.content.trim()
            )
            .slice(-12);
        }
      } catch (error) {
        console.warn("⚠️ Invalid history payload");
      }
    }

    let combinedText = "";

    for (const file of files) {
      console.log("📄 Processing:", file.path);

      const text = await extractTextFromPDF(file.path);

      console.log("📊 Extracted length:", text.length);

      combinedText += text + "\n";
    }

    console.log("📊 Combined text length:", combinedText.length);

    // Mode 1: regular chatbot behavior (no PDFs)
    if (!files.length) {
      if (!message) {
        return res.status(400).json({ response: "Message is required." });
      }

      const chatMessages = [
        {
          role: "system",
          content:
            "You are LearnSphere AI, a concise and friendly engineering tutor. Explain concepts clearly, use short examples, and include exam-focused tips when useful.",
        },
        ...parsedHistory,
        { role: "user", content: message },
      ];

      const aiResponse = await callOpenRouter(chatMessages, model);

      return res.json({
        response: aiResponse,
      });
    }

    // Mode 2: PDF analysis mode
    if (!combinedText || combinedText.length < 50) {
      return res.json({
        response: "Could not extract enough content from PDFs.",
      });
    }

    const prompt = `You are an expert exam analyzer.

From the following exam papers content:
- Extract at least 15 important questions
- Remove duplicates
- Group similar questions
- Format cleanly

Additional user instruction (if any): ${message || "None"}

CONTENT:
${combinedText}
`;

    const aiResponse = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You extract and organize important exam questions from uploaded papers in a clean, readable format.",
        },
        { role: "user", content: prompt },
      ],
      model
    );

    const firstFileName = files[0]?.originalname || "uploaded_pyq.pdf";
    const inferenceText = `${firstFileName} ${message} ${combinedText.slice(0, 1200)}`;
    const questions = extractQuestions(aiResponse);
    const topics = extractTopics(aiResponse, questions);

    const analysis = {
      subject: inferSubject(firstFileName),
      year: inferYear(inferenceText),
      examType: inferExamType(inferenceText),
      fileName: files.map((f) => f.originalname).join(", ") || firstFileName,
      topics,
      questions,
    };

    res.json({
      response: aiResponse,
      wasPDF: true,
      analysis,
    });
  } catch (err) {
    console.error("❌ Chat error:", err.message);

    res.status(500).json({
      response: "Connection failed. Check OPENROUTER_API_KEY",
    });
  }
};