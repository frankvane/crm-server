const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authJwt, rbac } = require("../middlewares");

// 创建用户（需要create_user权限）
router.post(
  "/",
  [authJwt.verifyToken, rbac.checkPermission("create_user")],
  userController.create
);

// 获取用户列表（需要view_users权限）
router.get(
  "/",
  [authJwt.verifyToken, rbac.checkPermission("view_users")],
  userController.list
);

// 获取单个用户（需要view_users权限）
router.get(
  "/:id",
  [authJwt.verifyToken, rbac.checkPermission("view_users")],
  userController.getById
);

// 更新用户（需要update_user权限）
router.put(
  "/:id",
  [authJwt.verifyToken, rbac.checkPermission("update_user")],
  userController.update
);

// 删除用户（需要delete_user权限）
router.delete(
  "/:id",
  [authJwt.verifyToken, rbac.checkPermission("delete_user")],
  userController.delete
);

module.exports = router;
