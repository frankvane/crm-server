const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authJwt } = require("../middlewares");

// 创建分类（使用已存在的权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:add")],
  categoryController.create
);

// 获取分类列表（添加查看权限验证）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:view")],
  categoryController.list
);

// 获取分类树（添加查看权限验证）
router.get(
  "/tree",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:view")],
  categoryController.getTree
);

// 获取单个分类（添加查看权限验证）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:view")],
  categoryController.getById
);

// 更新分类
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:edit")],
  categoryController.update
);

// 删除分类
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:delete")],
  categoryController.delete
);

module.exports = router;
