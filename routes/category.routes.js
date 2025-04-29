const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authJwt } = require("../middlewares");

// 创建分类（需要manage_categories权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("manage_categories")],
  categoryController.create
);

// 获取分类列表
router.get("/", [authJwt.verifyToken], categoryController.list);

// 获取分类树
router.get("/tree", [authJwt.verifyToken], categoryController.getTree);

// 更新分类（需要manage_categories权限）
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_categories")],
  categoryController.update
);

// 删除分类（需要manage_categories权限）
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_categories")],
  categoryController.delete
);

module.exports = router;
