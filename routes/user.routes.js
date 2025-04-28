const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const rbac = require("../middlewares/rbac");

// 创建用户（需要admin权限）
router.post("/", [auth, rbac("create_user")], userController.create);

// 获取用户列表（需要view_users权限）
router.get("/", [auth, rbac("view_users")], userController.list);

// 获取单个用户（需要view_users权限）
router.get("/:id", [auth, rbac("view_users")], userController.getById);

// 更新用户（需要update_user权限）
router.put("/:id", [auth, rbac("update_user")], userController.update);

// 删除用户（需要delete_user权限）
router.delete("/:id", [auth, rbac("delete_user")], userController.delete);

module.exports = router;
