const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-2f64147b603644059393aec63cdd03c0",
});

exports.streamChat = async (req, res) => {
  const { messages } = req.body;

  res.setHeader("Content-Type", "text/plain;charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.flushHeaders();

  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-chat",
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Stream error");
  }
};
