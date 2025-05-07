const { File, FileChunk } = require("../models");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// 秒传确认
exports.instantCheck = async (req, res) => {
  try {
    const { file_id, md5 } = req.body;
    const file = await File.findOne({ where: { file_id, md5, status: 1 } });
    if (file) {
      return res.json({
        code: 200,
        message: "ok",
        data: { uploaded: true, file },
      });
    }
    return res.json({ code: 200, message: "ok", data: { uploaded: false } });
  } catch (err) {
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

// 状态查询
exports.statusQuery = async (req, res) => {
  try {
    const { file_id } = req.query;
    const chunks = await FileChunk.findAll({ where: { file_id, status: 1 } });
    const uploadedChunks = chunks.map((c) => c.chunk_index);
    return res.json({ code: 200, message: "ok", data: { uploadedChunks } });
  } catch (err) {
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

// 分片上传
exports.uploadChunk = async (req, res) => {
  try {
    const { file_id, chunk_index, user_id } = req.body;
    // 记录分片上传
    await FileChunk.upsert({
      file_id,
      chunk_index,
      status: 1,
      user_id,
      upload_time: new Date(),
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
    const { file_id, file_name, size, user_id, md5, total_chunks } = req.body;
    const tmpDir = path.join(__dirname, "../tmp/upload");
    const targetPath = path.join(__dirname, "../uploads", file_name);
    const writeStream = fs.createWriteStream(targetPath);
    for (let i = 0; i < total_chunks; i++) {
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
    await File.upsert({ file_id, file_name, size, user_id, status: 1, md5 });
    await FileChunk.update({ status: 2 }, { where: { file_id } }); // 标记分片已合并
    await transaction.commit();
    return res.json({ code: 200, message: "ok", data: {} });
  } catch (err) {
    await transaction.rollback();
    return res.json({ code: 500, message: err.message, data: {} });
  }
};
