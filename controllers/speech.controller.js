const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const speechService = require("../services/speech.service");
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-2f64147b603644059393aec63cdd03c0",
});

exports.recognizeWav = async (req, res) => {
  try {
    let { wavPath } = req.body;
    if (!wavPath) {
      return res.status(400).json({
        code: 400,
        message: "缺少音频文件路径参数 wavPath",
        data: null,
      });
    }
    // 只允许识别 uploads 目录下的文件，防止路径穿越
    const safePath = path.basename(wavPath);
    const uploadsDir = path.resolve(__dirname, "../uploads");
    let absPath = path.join(uploadsDir, safePath);
    let wavAbsPath = absPath;

    // 如果是aac文件，先转为wav
    if (safePath.toLowerCase().endsWith(".aac")) {
      const wavFileName = safePath.replace(/\.aac$/i, ".wav");
      wavAbsPath = path.join(uploadsDir, wavFileName);
      // 若目标wav不存在则转换
      if (!fs.existsSync(wavAbsPath)) {
        await new Promise((resolve, reject) => {
          ffmpeg(absPath)
            .audioChannels(1)
            .audioFrequency(16000)
            .audioCodec("pcm_s16le")
            .format("wav")
            .on("end", resolve)
            .on("error", reject)
            .save(wavAbsPath);
        });
      }
    }

    // 1. 语音识别
    const result = await speechService.recognizeWav(wavAbsPath);
    if (result.code !== 200 || !result.data.text) {
      return res.status(result.code === 200 ? 400 : result.code).json(result);
    }

    // 2. 用 deepseek API 进行润色（只输出优化后的文本内容，不输出任何说明性内容）
    const prompt = `请帮我对下面的中文语音识别文本加上合适的标点符号，并根据上下文将明显的英文谐音词（如“瑞安”还原为“React”）自动还原为正确的英文单词。请直接输出优化后的文本内容，不要输出任何修改说明、优化说明、润色说明等说明性内容，也不要输出原文。只输出最终优化后的文本：\n${result.data.text}`;
    const systemPrompt =
      "你是一个语音识别文本优化助手，只做标点、语句通顺和英文谐音词还原，不随意修改其它内容。只输出最终优化后的文本，不要输出任何说明性内容。";
    let finalText = result.data.text;
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        model: "deepseek-chat",
      });
      finalText = completion.choices[0]?.message?.content?.trim() || finalText;
    } catch (e) {
      // deepseek 失败时返回原始识别内容
    }

    res.json({
      code: 200,
      message: "ok",
      data: { text: finalText },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};
