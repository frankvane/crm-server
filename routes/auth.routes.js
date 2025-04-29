const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// 用户登录
router.post("/login", authController.login);

// 刷新令牌
router.post("/refresh", authController.refresh);

// 注销登录
router.post("/logout", authController.logout);

module.exports = router;
