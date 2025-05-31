const { File, FileChunk } = require("../models");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const FileType = require("file-type");
const { generateThumbnail } = require("../utils/thumbnail");

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
  let transactionRolledBack = false;
  async function safeRollback() {
    if (!transactionRolledBack) {
      transactionRolledBack = true;
      await transaction.rollback();
    }
  }
  try {
    const tmpDir = path.join(__dirname, "../tmp/upload");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const { file_id, md5, name, size, total, user_id, category_id } = req.body;
    if (!file_id || !md5 || !name || !size || !total) {
      await safeRollback();
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    // 检查目录写权限
    try {
      fs.accessSync(uploadsDir, fs.constants.W_OK);
    } catch (e) {
      await safeRollback();
      return res.json({
        code: 500,
        message: "uploads目录不可写: " + e.message,
        data: {},
      });
    }
    const targetPath = path.join(uploadsDir, name);
    let writeStream;
    try {
      writeStream = fs.createWriteStream(targetPath);
    } catch (e) {
      await safeRollback();
      return res.json({
        code: 500,
        message: "创建写入流失败: " + e.message,
        data: {},
      });
    }
    // 捕获写入流错误
    let writeStreamError = null;
    writeStream.on("error", async (err) => {
      writeStreamError = err;
      await safeRollback();
      return res.json({
        code: 500,
        message: "写入文件失败: " + err.message,
        data: {},
      });
    });
    // 校验每个分片的md5
    const dbChunks = await FileChunk.findAll({ where: { file_id, status: 1 } });
    for (let i = 0; i < total; i++) {
      const chunkPath = path.join(tmpDir, `${file_id}_${i}`);
      if (!fs.existsSync(chunkPath)) {
        await safeRollback();
        return res.json({ code: 500, message: `分片${i}不存在`, data: {} });
      }
      const chunkBuffer = fs.readFileSync(chunkPath);
      const chunkMd5 = crypto
        .createHash("md5")
        .update(chunkBuffer)
        .digest("hex");
      const dbChunk = dbChunks.find((c) => c.chunk_index === i);
      if (!dbChunk) {
        await safeRollback();
        return res.json({
          code: 500,
          message: `数据库中未找到分片${i}`,
          data: {},
        });
      }
      if (dbChunk.chunk_md5 && dbChunk.chunk_md5 !== chunkMd5) {
        await safeRollback();
        return res.json({
          code: 500,
          message: `分片${i}的MD5与数据库不一致`,
          data: { index: i, db_md5: dbChunk.chunk_md5, real_md5: chunkMd5 },
        });
      }
      console.log(`分片${i} 大小: ${chunkBuffer.length}, MD5: ${chunkMd5}`);
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.on("end", resolve);
        readStream.on("error", reject);
        readStream.pipe(writeStream, { end: false });
      });
      fs.unlinkSync(chunkPath);
    }
    writeStream.end();
    // 将后续操作放入finish回调，确保写入完成后再处理
    writeStream.on("finish", async () => {
      try {
        // 校验MD5
        const fileBuffer = fs.readFileSync(targetPath);
        const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
        console.log(`前端传入MD5: ${md5}`);
        console.log(`合并后文件MD5: ${hash}`);
        if (hash !== md5) throw new Error("文件MD5校验失败");
        // 读取文件类型
        console.log("尝试检测文件类型:", targetPath); // 添加日志
        const getFileType = await FileType.fromFile(targetPath);
        console.log("文件类型检测结果:", getFileType); // 添加日志
        const fileExt = getFileType.ext;
        const fileType = getFileType.mime;
        // 生成相对路径
        const filePath = path.join("uploads", name);
        let thumbnailPath = null;
        // 生成缩略图
        if (fileType && fileType.startsWith("image/")) {
          const thumbName = name.replace(/(\.[^.]+)$/, "_thumb$1");
          thumbnailPath = path.join("uploads", thumbName);
          try {
            await generateThumbnail(
              targetPath,
              path.join(uploadsDir, thumbName),
              {
                width: 200,
                height: 200,
              }
            );
            console.log("缩略图生成成功");
          } catch (e) {
            console.warn("生成缩略图失败:", e.message);
            thumbnailPath = null;
          }
        }
        await File.upsert({
          file_id,
          file_name: name,
          size,
          user_id: user_id || "test",
          status: 1,
          md5,
          category_id: category_id || 1,
          file_ext: fileExt,
          file_type: fileType,
          file_path: filePath,
          thumbnail_path: thumbnailPath,
        });
        await FileChunk.update({ status: 2 }, { where: { file_id } }); // 标记分片已合并
        await transaction.commit();
        return res.json({ code: 200, message: "ok", data: {} });
      } catch (err) {
        await safeRollback();
        return res.json({ code: 500, message: err.message, data: {} });
      }
    });
  } catch (err) {
    await safeRollback();
    return res.json({ code: 500, message: err.message, data: {} });
  }
};
