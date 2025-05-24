const express = require("express");
const router = express.Router();
const resourceActionController = require("../controllers/resourceAction.controller");
const { authJwt } = require("../middlewares");

// 创建资源操作
router.post(
  "/:resourceId/actions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:add")],
  resourceActionController.create
);

// 获取资源操作列表
router.get(
  "/:resourceId/actions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceActionController.list
);

// 获取单个资源操作
router.get(
  "/:resourceId/actions/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceActionController.getById
);

// 更新资源操作
router.put(
  "/:resourceId/actions/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceActionController.update
);

// 删除资源操作
router.delete(
  "/:resourceId/actions/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:delete")],
  resourceActionController.delete
);

module.exports = router;
