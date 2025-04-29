const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authJwt } = require("../middlewares");

// 创建用户（需要create_user权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("create_user")],
  userController.create
);

// 获取用户列表（需要view_users权限）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("view_users")],
  userController.list
);

// 获取单个用户（需要view_users权限）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("view_users")],
  userController.getById
);

// 更新用户（需要update_user权限）
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("update_user")],
  userController.update
);

// 删除用户（需要delete_user权限）
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("delete_user")],
  userController.delete
);

// 修改用户密码
router.put(
  "/:id/password",
  [authJwt.verifyToken],
  userController.changePassword
);

// 切换用户状态（需要update_user权限）
router.put(
  "/:id/toggle-status",
  [authJwt.verifyToken, authJwt.hasPermission("update_user")],
  userController.toggleStatus
);

// 批量删除用户（需要delete_user权限）
router.delete(
  "/batch",
  [authJwt.verifyToken, authJwt.hasPermission("delete_user")],
  userController.batchDelete
);

module.exports = router;
