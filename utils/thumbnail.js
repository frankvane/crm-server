const sharp = require("sharp");
const fs = require("fs");

/**
 * 生成缩略图
 * @param {string} inputPath 原图路径
 * @param {string} outputPath 缩略图输出路径
 * @param {object} options { width, height } 可选，默认宽高 200x200
 * @returns {Promise<string>} 返回生成的缩略图路径
 */
async function generateThumbnail(inputPath, outputPath, options = {}) {
  const { width = 200, height = 200 } = options;
  if (!fs.existsSync(inputPath)) {
    throw new Error("原图文件不存在: " + inputPath);
  }
  await sharp(inputPath)
    .resize(width, height, { fit: "cover" })
    .toFile(outputPath);
  return outputPath;
}

module.exports = {
  generateThumbnail,
};
