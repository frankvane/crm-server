const { File, FileChunk } = require("../models");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// 秒传确认
exports.instantCheck = async (req, res) => {
  try {
    const { file_id, md5, name, size, chunk_md5s } = req.body;
    if (!file_id || !md5 || !name || !size) {
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }
    const file = await File.findOne({ where: { file_id, md5, status: 1 } });
    if (file) {
      return res.json({
        code: 200,
        message: "ok",
        data: { uploaded: true, file },
      });
    }
    // 如果有 chunk_md5s，校验每个分片的md5
    let chunkCheckResult = [];
    if (Array.isArray(chunk_md5s) && chunk_md5s.length > 0) {
      const chunks = await FileChunk.findAll({ where: { file_id, status: 1 } });
      // 以索引为准，校验每个分片的md5
      chunkCheckResult = chunk_md5s.map((md5, idx) => {
        const chunk = chunks.find((c) => c.chunk_index === idx);
        return {
          index: idx,
          exist: !!chunk,
          match: chunk ? chunk.chunk_md5 === md5 : false,
        };
      });
    }
    return res.json({
      code: 200,
      message: "ok",
      data: { uploaded: false, chunkCheckResult },
    });
  } catch (err) {
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

// 状态查询
exports.statusQuery = async (req, res) => {
  try {
    const { file_id, md5 } = req.query;
    if (!file_id || !md5) {
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }
    const chunks = await FileChunk.findAll({ where: { file_id, status: 1 } });
    const chunkIndexes = chunks.map((c) => c.chunk_index);
    return res.json({
      code: 200,
      message: "ok",
      data: { chunks: chunkIndexes },
    });
  } catch (err) {
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

// 分片上传
exports.uploadChunk = async (req, res) => {
  try {
    const tmpDir = path.join(__dirname, "../tmp/upload");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    let { file_id, index, user_id, chunk_md5 } = req.body;
    if (!file_id || index === undefined) {
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }
    index = parseInt(index, 10);
    if (isNaN(index)) {
      return res.json({ code: 400, message: "index必须为数字", data: {} });
    }
    if (!user_id) user_id = "test";
    await FileChunk.upsert({
      file_id,
      chunk_index: index,
      status: 1,
      user_id,
      upload_time: new Date(),
      chunk_md5,
    });
    return res.json({ code: 200, message: "ok", data: {} });
  } catch (err) {
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

// 分片合并
exports.mergeChunks = async (req, res) => {
  const transaction = await File.sequelize.transaction();
  try {
    const tmpDir = path.join(__dirname, "../tmp/upload");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const { file_id, md5, name, size, total, user_id } = req.body;
    if (!file_id || !md5 || !name || !size || !total) {
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const targetPath = path.join(uploadsDir, name);
    const writeStream = fs.createWriteStream(targetPath);
    for (let i = 0; i < total; i++) {
      const chunkPath = path.join(tmpDir, `${file_id}_${i}`);
      if (!fs.existsSync(chunkPath)) throw new Error(`分片${i}不存在`);
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.on("end", resolve);
        readStream.on("error", reject);
        readStream.pipe(writeStream, { end: false });
      });
      fs.unlinkSync(chunkPath);
    }
    writeStream.end();
    // 校验MD5
    const fileBuffer = fs.readFileSync(targetPath);
    const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
    if (hash !== md5) throw new Error("文件MD5校验失败");
    // 更新数据库
    await File.upsert({
      file_id,
      file_name: name,
      size,
      user_id: user_id || "test",
      status: 1,
      md5,
    });
    await FileChunk.update({ status: 2 }, { where: { file_id } }); // 标记分片已合并
    await transaction.commit();
    return res.json({ code: 200, message: "ok", data: {} });
  } catch (err) {
    await transaction.rollback();
    return res.json({ code: 500, message: err.message, data: {} });
  }
};
