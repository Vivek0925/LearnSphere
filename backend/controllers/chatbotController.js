const Note = require("../models/Note");
const PYQ = require("../models/PYQ");

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    // AI Tutor System Prompt
    const systemPrompt = `You are LearnSphere AI, an expert engineering tutor helping students with:

Subjects:
- Data Structures (arrays, trees, graphs, hashing, dynamic programming)
- Algorithms (sorting, searching, graph algorithms, complexity analysis)
- Operating Systems (scheduling, deadlock, memory management, synchronization)
- DBMS (normalization, SQL, transactions, indexing, ER models)
- Computer Networks (OSI model, TCP/IP, routing, application layer)
- Software Engineering (SDLC, testing, UML, design patterns)

Guidelines:
- Give clear, structured explanations
- Use bullet points when possible
- Provide real examples
- Include time & space complexity for algorithms
- Provide step-by-step explanations
- Use simple language for students
- Encourage learning`;

    // limit history to last 10 messages
    const messages = [
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    // Models with fallback
    const models = [
      "deepseek/deepseek-chat:free",
      "nousresearch/hermes-2-pro-llama-3-8b:free",
      "openchat/openchat-7b:free",
    ];

    let aiResponse = null;
    let usedModel = null;

    // Try models one by one if a model fails
    for (const model of models) {
      try {
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
              max_tokens: 1500,
              temperature: 0.7,
            }),
          },
        );

        if (!response.ok) {
          const err = await response.json();
          console.log(`Model failed: ${model}`, err);
          continue;
        }

        const data = await response.json();

        aiResponse =
          data.choices?.[0]?.message?.content ||
          "Sorry, I couldn't generate a response.";

        usedModel = data.model || model;

        break;
      } catch (err) {
        console.log(`Model crashed: ${model}`);
        continue;
      }
    }

    if (!aiResponse) {
      return res.status(500).json({
        message: "All AI models failed. Please try again later.",
      });
    }

    res.json({
      response: aiResponse,
      model: usedModel,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: err.message });
  }
};
