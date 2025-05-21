const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 临时分片存储目录
const tmpDir = path.join(__dirname, "../tmp/upload");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const { file_id, index } = req.body;
    cb(null, `${file_id}_${index}`);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * /file/instant:
 *   post:
 *     tags:
 *       - 文件管理
 *     summary: 秒传确认
 *     description: 校验文件是否已上传，支持分片MD5校验。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file_id:
 *                 type: string
 *                 description: 文件唯一ID
 *               md5:
 *                 type: string
 *                 description: 文件MD5
 *               name:
 *                 type: string
 *                 description: 文件名
 *               size:
 *                 type: integer
 *                 description: 文件大小
 *               chunk_md5s:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 分片MD5数组
 *     responses:
 *       200:
 *         description: 返回上传状态和分片校验结果
 */
// 秒传确认
router.post("/file/instant", fileController.instantCheck);
/**
 * @swagger
 * /file/status:
 *   get:
 *     tags:
 *       - 文件管理
 *     summary: 文件分片状态查询
 *     description: 查询已上传的分片索引。
 *     parameters:
 *       - in: query
 *         name: file_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 文件唯一ID
 *       - in: query
 *         name: md5
 *         schema:
 *           type: string
 *         required: true
 *         description: 文件MD5
 *     responses:
 *       200:
 *         description: 返回已上传分片索引数组
 */
// 状态查询
router.get("/file/status", fileController.statusQuery);
/**
 * @swagger
 * /file/upload:
 *   post:
 *     tags:
 *       - 文件管理
 *     summary: 分片上传
 *     description: 上传单个文件分片，支持MD5校验。
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file_id:
 *                 type: string
 *                 description: 文件唯一ID
 *               index:
 *                 type: integer
 *                 description: 分片索引
 *               user_id:
 *                 type: string
 *                 description: 用户ID
 *               chunk_md5:
 *                 type: string
 *                 description: 分片MD5
 *               chunk:
 *                 type: string
 *                 format: binary
 *                 description: 分片文件内容
 *     responses:
 *       200:
 *         description: 上传结果
 */
// 分片上传
router.post("/file/upload", upload.single("chunk"), fileController.uploadChunk);
/**
 * @swagger
 * /file/merge:
 *   post:
 *     tags:
 *       - 文件管理
 *     summary: 分片合并
 *     description: 合并所有分片为完整文件，并校验MD5。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file_id:
 *                 type: string
 *                 description: 文件唯一ID
 *               md5:
 *                 type: string
 *                 description: 文件MD5
 *               name:
 *                 type: string
 *                 description: 文件名
 *               size:
 *                 type: integer
 *                 description: 文件大小
 *               total:
 *                 type: integer
 *                 description: 分片总数
 *               user_id:
 *                 type: string
 *                 description: 用户ID
 *               category_id:
 *                 type: integer
 *                 description: 分类ID
 *     responses:
 *       200:
 *         description: 合并结果
 */
// 分片合并
router.post("/file/merge", fileController.mergeChunks);

module.exports = router;
