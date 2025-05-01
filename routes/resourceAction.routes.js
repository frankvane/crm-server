const express = require("express");
const router = express.Router();
const resourceActionController = require("../controllers/resourceAction.controller");
const { authJwt } = require("../middlewares");

// 创建资源操作（修改为使用正确的权限格式）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("system:resource:add")],
  resourceActionController.create
);

// 获取资源操作列表（修改为使用正确的权限格式）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("system:resource:edit")],
  resourceActionController.list
);

// 获取单个资源操作（修改为使用正确的权限格式）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:resource:edit")],
  resourceActionController.getById
);

// 更新资源操作（修改为使用正确的权限格式）
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:resource:edit")],
  resourceActionController.update
);

// 删除资源操作（修改为使用正确的权限格式）
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:resource:delete")],
  resourceActionController.delete
);

module.exports = router;
