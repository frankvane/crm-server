const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");
const resourceActionRoutes = require("./resourceAction.routes");
const { authJwt } = require("../middlewares");

// 资源操作相关路由
router.use("/", resourceActionRoutes);

// 获取资源树
router.get(
  "/tree",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.tree
);

// 获取资源树及其下所有按钮权限
router.get(
  "/tree-with-actions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.treeWithActions
);

// 创建资源（修改为使用正确的权限格式）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:add")],
  resourceController.create
);

// 获取资源列表（由于没有view，使用edit权限）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.list
);

// 获取单个资源（由于没有view，使用edit权限）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.getById
);

// 更新资源
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.update
);

// 删除资源
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:delete")],
  resourceController.delete
);

module.exports = router;
