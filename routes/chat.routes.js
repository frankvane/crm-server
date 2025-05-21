const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

/**
 * @swagger
 * /stream-chat:
 *   post:
 *     tags:
 *       - 对话流
 *     summary: 流式对话接口
 *     description: 调用 deepseek OpenAI API 实现流式输出。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户输入内容
 *     responses:
 *       200:
 *         description: 返回流式对话内容
 */

router.post("/stream-chat", chatController.streamChat);

module.exports = router;
