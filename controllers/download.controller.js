const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// 文件ID缓存，避免重复计算MD5
const fileIdCache = new Map();

/**
 * 获取可下载文件列表
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.getFileList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // 读取download目录中的文件
    const downloadDir = path.join(__dirname, "../download");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // 获取所有文件
    let files = fs
      .readdirSync(downloadDir)
      .filter((file) => {
        // 排除隐藏文件和目录
        if (file.startsWith(".")) return false;
        const filePath = path.join(downloadDir, file);
        return fs.statSync(filePath).isFile();
      })
      .map((file) => {
        const filePath = path.join(downloadDir, file);
        const stats = fs.statSync(filePath);

        // 获取文件ID和MD5（优先使用缓存）
        let fileId, md5;
        if (fileIdCache.has(filePath)) {
          const cachedInfo = fileIdCache.get(filePath);
          // 检查文件修改时间是否变化，变化则重新计算
          if (cachedInfo.mtime === stats.mtime.getTime()) {
            fileId = cachedInfo.fileId;
            md5 = cachedInfo.md5;
          } else {
            // 修改时间变化，计算文件MD5
            md5 = calculatePartialMd5(filePath);
            fileId = md5.substring(0, 8);
            fileIdCache.set(filePath, {
              fileId,
              md5,
              mtime: stats.mtime.getTime(),
            });
          }
        } else {
          // 计算文件MD5
          md5 = calculatePartialMd5(filePath);
          fileId = md5.substring(0, 8);
          fileIdCache.set(filePath, {
            fileId,
            md5,
            mtime: stats.mtime.getTime(),
          });
        }

        // 获取文件扩展名
        const fileExt = path.extname(file).replace(".", "");

        return {
          id: fileId,
          fileName: file,
          fileSize: stats.size,
          fileType: getFileType(fileExt),
          fileExt: fileExt,
          url: `/file/download/${fileId}`,
          thumbnailUrl: null, // 暂不支持缩略图
          createdAt: stats.birthtime,
          md5: md5,
        };
      });

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      files = files.filter((file) =>
        file.fileName.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const total = files.length;
    files = files.slice(offset, offset + parseInt(limit, 10));

    return res.json({
      code: 200,
      message: "ok",
      data: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        files,
      },
    });
  } catch (err) {
    console.error("获取文件列表失败:", err);
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

/**
 * 根据扩展名获取文件类型
 * @param {string} ext 文件扩展名
 * @returns {string} 文件MIME类型
 */
function getFileType(ext) {
  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    txt: "text/plain",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
  };

  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}

/**
 * 计算文件部分内容的MD5
 * 对于大文件只计算开头部分，以加快速度
 * @param {string} filePath 文件路径
 * @returns {string} MD5哈希值
 */
function calculatePartialMd5(filePath) {
  const hash = crypto.createHash("md5");
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  // 对于小文件（<10MB），直接读取整个文件计算MD5
  if (fileSize < 10 * 1024 * 1024) {
    const buffer = fs.readFileSync(filePath);
    hash.update(buffer);
    return hash.digest("hex");
  }

  // 对于大文件，只读取开头的10MB和末尾的1MB
  const fd = fs.openSync(filePath, "r");

  // 读取开头10MB
  const headerBuffer = Buffer.alloc(10 * 1024 * 1024);
  fs.readSync(fd, headerBuffer, 0, 10 * 1024 * 1024, 0);
  hash.update(headerBuffer);

  // 读取末尾1MB
  if (fileSize > 11 * 1024 * 1024) {
    // 确保文件足够大
    const tailBuffer = Buffer.alloc(1024 * 1024);
    fs.readSync(fd, tailBuffer, 0, 1024 * 1024, fileSize - 1024 * 1024);
    hash.update(tailBuffer);
  }

  fs.closeSync(fd);
  return hash.digest("hex");
}

/**
 * 获取文件信息
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.getFileInfo = async (req, res) => {
  try {
    const { file_id } = req.params;
    if (!file_id) {
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }

    const downloadDir = path.join(__dirname, "../download");

    // 查找对应的文件
    const foundFile = findFileById(downloadDir, file_id);
    if (!foundFile) {
      return res.json({ code: 404, message: "文件不存在", data: {} });
    }

    const { filePath, fileName, md5 } = foundFile;
    const stats = fs.statSync(filePath);
    const fileExt = path.extname(fileName).replace(".", "");

    return res.json({
      code: 200,
      message: "ok",
      data: {
        id: file_id,
        fileName: fileName,
        fileSize: stats.size,
        fileType: getFileType(fileExt),
        fileExt: fileExt,
        url: `/file/download/${file_id}`,
        thumbnailUrl: null,
        createdAt: stats.birthtime,
        md5: md5,
      },
    });
  } catch (err) {
    console.error("获取文件信息失败:", err);
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

/**
 * 下载文件
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.downloadFile = async (req, res) => {
  try {
    const { file_id } = req.params;
    if (!file_id) {
      return res.status(400).json({ code: 400, message: "参数缺失", data: {} });
    }

    const downloadDir = path.join(__dirname, "../download");

    // 查找对应的文件
    const foundFile = findFileById(downloadDir, file_id);
    if (!foundFile) {
      return res
        .status(404)
        .json({ code: 404, message: "文件不存在", data: {} });
    }

    const { filePath, fileName, md5 } = foundFile;

    // 文件状态检查
    const stats = fs.statSync(filePath);
    const fileExt = path.extname(fileName).replace(".", "");
    const fileType = getFileType(fileExt);

    // 检查是否为范围请求(断点续传)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = end - start + 1;

      // 验证范围
      if (start >= stats.size || end >= stats.size) {
        return res.status(416).json({
          code: 416,
          message: "请求范围不满足",
          data: { fileSize: stats.size },
        });
      }

      // 设置响应头
      res.status(206); // 部分内容
      res.setHeader("Content-Range", `bytes ${start}-${end}/${stats.size}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunkSize);
      res.setHeader("Content-Type", fileType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );

      // 发送部分文件
      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      // 完整下载
      res.setHeader("Content-Length", stats.size);
      res.setHeader("Content-Type", fileType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("ETag", `"${md5}"`);
      res.setHeader("Last-Modified", stats.mtime.toUTCString());

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (err) {
    console.error("下载文件失败:", err);
    return res.status(500).json({ code: 500, message: err.message, data: {} });
  }
};

/**
 * 获取文件分片
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.downloadChunk = async (req, res) => {
  try {
    const { file_id, index } = req.params;
    if (!file_id || index === undefined) {
      return res.status(400).json({ code: 400, message: "参数缺失", data: {} });
    }

    const chunkIndex = parseInt(index, 10);
    if (isNaN(chunkIndex)) {
      return res
        .status(400)
        .json({ code: 400, message: "分片索引必须为数字", data: {} });
    }

    const downloadDir = path.join(__dirname, "../download");

    // 查找对应的文件
    const foundFile = findFileById(downloadDir, file_id);
    if (!foundFile) {
      return res
        .status(404)
        .json({ code: 404, message: "文件不存在", data: {} });
    }

    const { filePath, fileName, md5 } = foundFile;

    // 检查文件状态
    const stats = fs.statSync(filePath);
    const fileExt = path.extname(fileName).replace(".", "");
    const fileType = getFileType(fileExt);

    // 获取请求中的分片大小，默认5MB
    const chunkSize = parseInt(req.query.chunkSize, 10) || 5 * 1024 * 1024;

    // 计算分片范围
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize - 1, stats.size - 1);

    // 验证范围
    if (start >= stats.size) {
      return res.status(416).json({
        code: 416,
        message: "请求范围不满足",
        data: {
          fileSize: stats.size,
          totalChunks: Math.ceil(stats.size / chunkSize),
        },
      });
    }

    // 设置响应头
    res.status(206); // 部分内容
    res.setHeader("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", end - start + 1);
    res.setHeader("Content-Type", fileType);
    res.setHeader("X-File-Size", stats.size);
    res.setHeader("X-File-Name", encodeURIComponent(fileName));
    res.setHeader("X-File-Type", fileType);
    res.setHeader("X-File-Id", file_id);
    res.setHeader("X-Total-Chunks", Math.ceil(stats.size / chunkSize));
    res.setHeader("X-Chunk-Index", chunkIndex);
    res.setHeader("X-Chunk-Size", chunkSize);

    // 检查If-Range头，支持恢复下载
    const ifRange = req.headers["if-range"];
    if (ifRange && ifRange !== `"${md5}"`) {
      // ETag不匹配，客户端可能有过期或损坏的文件副本
      return res.status(412).json({
        code: 412,
        message: "文件已更改，请重新开始下载",
        data: { fileId: file_id },
      });
    }

    // 创建读取流并计算MD5
    const fileStream = fs.createReadStream(filePath, { start, end });
    const hash = crypto.createHash("md5");

    // 使用管道而不是读取整个分片到内存
    const passThrough = new (require("stream").PassThrough)();
    fileStream.pipe(passThrough);

    // 计算分片MD5
    let chunkBuffer = Buffer.alloc(0);
    passThrough.on("data", (chunk) => {
      hash.update(chunk);
      // 如果分片不大（小于50MB），收集数据用于MD5计算
      if (end - start + 1 < 50 * 1024 * 1024) {
        chunkBuffer = Buffer.concat([chunkBuffer, chunk]);
      }
    });

    passThrough.on("end", () => {
      let chunkMd5;
      if (chunkBuffer.length > 0 && chunkBuffer.length === end - start + 1) {
        // 如果收集了完整数据，直接使用它计算MD5
        chunkMd5 = crypto.createHash("md5").update(chunkBuffer).digest("hex");
      } else {
        // 否则使用流式计算的结果
        chunkMd5 = hash.digest("hex");
      }
      res.setHeader("X-Chunk-MD5", chunkMd5);

      // 保存分片MD5到缓存，便于后续验证
      if (!fileIdCache.has(filePath + "_chunks")) {
        fileIdCache.set(filePath + "_chunks", {});
      }
      const chunkCache = fileIdCache.get(filePath + "_chunks");
      chunkCache[chunkIndex] = chunkMd5;
    });

    // 发送文件分片到客户端
    passThrough.pipe(res);

    // 监听客户端断开连接
    req.on("close", () => {
      if (!res.writableEnded) {
        console.log(`客户端在下载分片${chunkIndex}时断开连接`);
        fileStream.destroy();
        passThrough.destroy();
      }
    });
  } catch (err) {
    console.error("下载文件分片失败:", err);
    return res.status(500).json({ code: 500, message: err.message, data: {} });
  }
};

/**
 * 获取文件下载信息（用于支持断点续传）
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.getDownloadInfo = async (req, res) => {
  try {
    const { file_id } = req.params;
    if (!file_id) {
      return res.json({ code: 400, message: "参数缺失", data: {} });
    }

    const downloadDir = path.join(__dirname, "../download");

    // 查找对应的文件
    const foundFile = findFileById(downloadDir, file_id);
    if (!foundFile) {
      return res.json({ code: 404, message: "文件不存在", data: {} });
    }

    const { filePath, fileName, md5 } = foundFile;

    // 获取文件状态
    const stats = fs.statSync(filePath);
    const fileExt = path.extname(fileName).replace(".", "");
    const fileType = getFileType(fileExt);

    // 计算推荐的分片大小
    let recommendedChunkSize = 5 * 1024 * 1024; // 默认5MB
    if (stats.size > 1024 * 1024 * 1024) {
      // 大于1GB
      recommendedChunkSize = 20 * 1024 * 1024; // 20MB
    } else if (stats.size > 100 * 1024 * 1024) {
      // 大于100MB
      recommendedChunkSize = 10 * 1024 * 1024; // 10MB
    }

    // 获取分片的MD5缓存（如果有）
    const chunksCache = fileIdCache.get(filePath + "_chunks") || {};
    const totalChunks = Math.ceil(stats.size / recommendedChunkSize);

    // 检查已下载的分片
    const downloadedChunks = [];
    if (req.query.checkChunks === "true") {
      // 如果客户端请求检查已下载的分片
      for (let i = 0; i < totalChunks; i++) {
        if (chunksCache[i]) {
          downloadedChunks.push({
            index: i,
            md5: chunksCache[i],
          });
        }
      }
    }

    return res.json({
      code: 200,
      message: "ok",
      data: {
        id: file_id,
        fileName: fileName,
        fileSize: stats.size,
        fileType: fileType,
        fileExt: fileExt,
        md5: md5,
        lastModified: stats.mtime.toISOString(),
        supportsRanges: true,
        recommendedChunkSize,
        totalChunks,
        downloadedChunks:
          downloadedChunks.length > 0 ? downloadedChunks : undefined,
        urls: {
          download: `/file/download/${file_id}`,
          chunk: `/file/download/${file_id}/chunk/{index}`,
          info: `/file/download/${file_id}/info`,
        },
        supportsPause: true,
        supportsResume: true,
      },
    });
  } catch (err) {
    console.error("获取下载信息失败:", err);
    return res.json({ code: 500, message: err.message, data: {} });
  }
};

/**
 * 根据文件ID查找文件
 * @param {string} dirPath 目录路径
 * @param {string} fileId 文件ID（MD5前8位）
 * @returns {Object|null} 找到的文件信息，包含filePath、fileName和md5，如果没找到则返回null
 */
function findFileById(dirPath, fileId) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return null;
  }

  // 检查缓存中是否有匹配的文件ID
  for (const [filePath, info] of fileIdCache.entries()) {
    if (info.fileId === fileId) {
      const fileName = path.basename(filePath);
      // 验证文件是否仍然存在
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return { filePath, fileName, md5: info.md5 };
      } else {
        // 文件不存在，从缓存中移除
        fileIdCache.delete(filePath);
      }
    }
  }

  // 如果缓存中没有，则搜索目录
  const files = fs.readdirSync(dirPath).filter((file) => {
    if (file.startsWith(".")) return false;
    const filePath = path.join(dirPath, file);
    return fs.statSync(filePath).isFile();
  });

  // 遍历所有文件，计算每个文件的MD5并比较
  for (const fileName of files) {
    const filePath = path.join(dirPath, fileName);
    try {
      // 计算文件的MD5并检查
      const stats = fs.statSync(filePath);
      let md5, computedFileId;

      // 检查文件是否已在缓存中且修改时间未变
      if (
        fileIdCache.has(filePath) &&
        fileIdCache.get(filePath).mtime === stats.mtime.getTime()
      ) {
        const cachedInfo = fileIdCache.get(filePath);
        md5 = cachedInfo.md5;
        computedFileId = cachedInfo.fileId;
      } else {
        // 计算文件的部分MD5
        md5 = calculatePartialMd5(filePath);
        computedFileId = md5.substring(0, 8);

        // 更新缓存
        fileIdCache.set(filePath, {
          fileId: computedFileId,
          md5,
          mtime: stats.mtime.getTime(),
        });
      }

      // 比较ID
      if (computedFileId === fileId) {
        return { filePath, fileName, md5 };
      }
    } catch (err) {
      console.error(`计算文件 ${fileName} 的MD5失败:`, err);
    }
  }

  return null;
}
