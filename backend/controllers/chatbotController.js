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
async function callOpenRouter(prompt) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("Missing OpenRouter API Key");
  }

  try {
    console.log("🚀 Sending to AI...");

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an AI tutor. Extract important exam questions from given content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
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

    let combinedText = "";

    for (const file of files) {
      console.log("📄 Processing:", file.path);

      const text = await extractTextFromPDF(file.path);

      console.log("📊 Extracted length:", text.length);

      combinedText += text + "\n";
    }

    console.log("📊 Combined text length:", combinedText.length);

    if (!combinedText || combinedText.length < 50) {
      return res.json({
        response: "Could not extract enough content from PDFs.",
      });
    }

    const prompt = `
You are an expert exam analyzer.

From the following exam papers content:
- Extract at least 15 important questions
- Remove duplicates
- Group similar questions
- Format cleanly

CONTENT:
${combinedText}
`;

    const aiResponse = await callOpenRouter(prompt);

    res.json({
      response: aiResponse,
    });
  } catch (err) {
    console.error("❌ Chat error:", err.message);

    res.status(500).json({
      response: "Connection failed. Check OPENROUTER_API_KEY",
    });
  }
};