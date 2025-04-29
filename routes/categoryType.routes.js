const express = require("express");
const router = express.Router();
const categoryTypeController = require("../controllers/categoryType.controller");
const { authJwt } = require("../middlewares");

// 创建分类类型（需要manage_categories权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("manage_categories")],
  categoryTypeController.create
);

// 获取分类类型列表
router.get("/", [authJwt.verifyToken], categoryTypeController.findAll);

// 获取单个分类类型
router.get("/:id", [authJwt.verifyToken], categoryTypeController.findOne);

// 更新分类类型（需要manage_categories权限）
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_categories")],
  categoryTypeController.update
);

// 删除分类类型（需要manage_categories权限）
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_categories")],
  categoryTypeController.delete
);

module.exports = router;
