const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.chatWithAssistant = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Groq API Key not configured" });
  }

  try {
    const messages = [
      { role: "system", content: "You are a helpful Skill Certification Assistant. Help users with exams, explain coding concepts, and guide them. Keep answers concise." },
      ...history.map(h => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text
      })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });

    const reply = chatCompletion.choices[0]?.message?.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    res.status(500).json({ error: "Failed to connect to Groq AI" });
  }
};
