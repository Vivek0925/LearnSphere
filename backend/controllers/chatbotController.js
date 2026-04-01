const Note = require("../models/Note");
const PYQ = require("../models/PYQ");

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    // ✅ System Prompt
    const systemPrompt = `You are LearnSphere AI, an expert engineering tutor helping students with:

Subjects:
- Data Structures
- Algorithms
- Operating Systems
- DBMS
- Computer Networks
- Software Engineering

Guidelines:
- Give clear structured explanations
- Use bullet points
- Give examples
- Include time & space complexity
- Keep language simple`;

    // ✅ Limit history
    const messages = [
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    // ✅ WORKING MODELS (IMPORTANT 🔥)
    const models = [
      "meta-llama/llama-3-8b-instruct",
      "mistralai/mistral-7b-instruct",
      "google/gemma-7b-it",
    ];

    let aiResponse = null;
    let usedModel = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "LearnSphere AI Tutor",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                ...messages,
              ],
              max_tokens: 1000,
              temperature: 0.7,
            }),
          }
        );

        const data = await response.json();

        // ❗ If API gives error
        if (!response.ok || data.error) {
          console.log(`❌ Failed model: ${model}`, data.error);
          continue;
        }

        // ✅ Success
        aiResponse =
          data.choices?.[0]?.message?.content ||
          "No response generated.";

        usedModel = data.model || model;

        console.log(`✅ Success with model: ${model}`);
        break;
      } catch (err) {
        console.log(`💥 Crash on model: ${model}`, err.message);
        continue;
      }
    }

    // ❌ If all fail
    if (!aiResponse) {
      return res.status(500).json({
        message:
          "All AI models failed. Check API key, credits, or model availability.",
      });
    }

    // ✅ Final response
    res.json({
      response: aiResponse,
      model: usedModel,
      timestamp: new Date(),
    });

  } catch (err) {
    console.error("🔥 Chatbot error:", err);
    res.status(500).json({ message: err.message });
  }
};