const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authJwt } = require("../middlewares");

// 获取当前登录用户信息（含角色、菜单、按钮权限）
router.get("/me", [authJwt.verifyToken], userController.me);

// 创建用户（使用已存在的权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:add")],
  userController.create
);

// 获取用户列表（修改为使用已存在的权限，如编辑权限）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:edit")],
  userController.list
);

// 获取单个用户（修改为使用已存在的权限，如编辑权限）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:edit")],
  userController.getById
);

// 更新用户
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:edit")],
  userController.update
);

// 删除用户
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:delete")],
  userController.delete
);

// 修改用户密码
router.put(
  "/:id/password",
  [authJwt.verifyToken],
  userController.changePassword
);

// 切换用户状态
router.put(
  "/:id/toggle-status",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:edit")],
  userController.toggleStatus
);

// 批量删除用户
router.delete(
  "/batch",
  [authJwt.verifyToken, authJwt.hasPermission("system:user:delete")],
  userController.batchDelete
);

module.exports = router;
