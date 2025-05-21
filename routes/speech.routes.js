const express = require("express");
const router = express.Router();
const { recognizeWav } = require("../controllers/speech.controller");

/**
 * @swagger
 * /speech/recognize:
 *   post:
 *     tags:
 *       - 语音识别
 *     summary: 语音识别
 *     description: 对上传的音频文件进行语音识别，支持wav/aac格式。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wavPath:
 *                 type: string
 *                 description: 音频文件相对路径（如uploads/xxx.wav）
 *     responses:
 *       200:
 *         description: 返回识别结果
 */

// 语音识别接口
router.post("/recognize", recognizeWav);

module.exports = router;
