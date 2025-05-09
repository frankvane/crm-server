const vosk = require("vosk");
const fs = require("fs");
const { Readable } = require("stream");
const wav = require("wav");
const voskModel = require("./voskModel");

class SpeechService {
  async recognizeWav(wavPath) {
    if (!fs.existsSync(wavPath)) {
      return {
        code: 400,
        message: `音频文件不存在: ${wavPath}`,
        data: null,
      };
    }
    try {
      const model = await voskModel.loadModel();
      const wfReader = new wav.Reader();
      const wfReadable = new Readable().wrap(wfReader);
      return await new Promise((resolve, reject) => {
        wfReader.on("format", async ({ audioFormat, sampleRate, channels }) => {
          if (audioFormat !== 1 || channels !== 1) {
            return resolve({
              code: 400,
              message: "音频文件必须为单声道PCM WAV格式",
              data: null,
            });
          }
          const rec = new vosk.Recognizer({ model, sampleRate });
          for await (const data of wfReadable) {
            rec.acceptWaveform(data);
          }
          const final = rec.finalResult();
          rec.free();
          resolve({
            code: 200,
            message: "ok",
            data: { text: final && final.text ? final.text : "" },
          });
        });
        fs.createReadStream(wavPath, { highWaterMark: 4096 })
          .pipe(wfReader)
          .on("error", (err) => {
            resolve({
              code: 500,
              message: "音频读取失败: " + err.message,
              data: null,
            });
          });
      });
    } catch (error) {
      return {
        code: 500,
        message: "模型加载或识别失败: " + error.message,
        data: null,
      };
    }
  }
}

module.exports = new SpeechService();
