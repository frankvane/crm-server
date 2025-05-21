const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - 认证与授权
 *     summary: 用户登录
 *     description: 用户登录，获取token。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *           examples:
 *             admin:
 *               summary: 管理员账号
 *               value:
 *                 username: admin
 *                 password: admin123
 *             manager:
 *               summary: 高级管理员账号
 *               value:
 *                 username: manager
 *                 password: manager123
 *             user:
 *               summary: 普通管理员账号
 *               value:
 *                 username: user
 *                 password: user123
 *     responses:
 *       200:
 *         description: 登录成功，返回token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
// 用户登录
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - 认证与授权
 *     summary: 刷新令牌
 *     description: 使用refreshToken刷新accessToken。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *     responses:
 *       200:
 *         description: 返回新的accessToken
 */
// 刷新令牌
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - 认证与授权
 *     summary: 注销登录
 *     description: 注销当前用户登录状态。
 *     responses:
 *       200:
 *         description: 注销成功
 */
// 注销登录
router.post("/logout", authController.logout);

module.exports = router;
