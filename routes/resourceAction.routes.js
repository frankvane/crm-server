const express = require("express");
const router = express.Router();
const resourceActionController = require("../controllers/resourceAction.controller");
const { authJwt } = require("../middlewares");

// 创建资源操作（需要manage_resource_actions权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("manage_resource_actions")],
  resourceActionController.create
);

// 获取资源操作列表（需要view_resource_actions权限）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("view_resource_actions")],
  resourceActionController.list
);

// 获取单个资源操作（需要view_resource_actions权限）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("view_resource_actions")],
  resourceActionController.getById
);

// 更新资源操作（需要manage_resource_actions权限）
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_resource_actions")],
  resourceActionController.update
);

// 删除资源操作（需要manage_resource_actions权限）
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("manage_resource_actions")],
  resourceActionController.delete
);

module.exports = router;
