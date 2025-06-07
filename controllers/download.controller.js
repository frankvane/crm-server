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
    const { search } = req.query;

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

    return res.json({
      code: 200,
      message: "ok",
      data: {
        total: files.length,
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
