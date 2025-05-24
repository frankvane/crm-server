const vosk = require("vosk");
const fs = require("fs");
const path = require("path");

class VoskModelService {
  constructor() {
    this.model = null;
    this.isLoading = false;
    this.loadPromise = null;
    this.MODEL_PATH = path.join(__dirname, "../model");
  }

  async loadModel() {
    if (this.model) return this.model;
    if (this.isLoading) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        if (!fs.existsSync(this.MODEL_PATH)) {
          throw new Error("模型文件夹不存在，请下载并解压到 model 目录");
        }
        this.model = new vosk.Model(this.MODEL_PATH);
        resolve(this.model);
      } catch (error) {
        reject(error);
      } finally {
        this.isLoading = false;
      }
    });

    return this.loadPromise;
  }

  getModel() {
    return this.model;
  }

  freeModel() {
    if (this.model) {
      this.model.free();
      this.model = null;
    }
  }
}

module.exports = new VoskModelService();
