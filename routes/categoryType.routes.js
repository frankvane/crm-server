const express = require("express");
const router = express.Router();
const categoryTypeController = require("../controllers/categoryType.controller");
const { authJwt } = require("../middlewares");

// 创建分类类型
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:type:add")],
  categoryTypeController.create
);

// 获取分类类型列表（添加查看权限验证）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:type:view")],
  categoryTypeController.findAll
);

// 获取单个分类类型（添加查看权限验证）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:type:view")],
  categoryTypeController.findOne
);

// 更新分类类型
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:type:edit")],
  categoryTypeController.update
);

// 删除分类类型
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:type:delete")],
  categoryTypeController.delete
);

module.exports = router;
