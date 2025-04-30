const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");
const { authJwt } = require("../middlewares");

// 创建资源（需要manage_resources权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("manage_resources")],
  resourceController.create
);

// 获取资源列表（需要view_resources权限）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("view_resources")],
  resourceController.list
);

// 获取单个资源（需要view_resources权限）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("view_resources")],
  resourceController.getById
);

// 更新资源（需要manage_resources权限）
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_resources")],
  resourceController.update
);

// 删除资源（需要manage_resources权限）
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_resources")],
  resourceController.delete
);

module.exports = router;
