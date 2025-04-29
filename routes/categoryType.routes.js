const express = require("express");
const router = express.Router();
const categoryTypeController = require("../controllers/categoryType.controller");
const { authJwt, rbac } = require("../middlewares");

// 所有路由都需要JWT认证
router.use(authJwt.verifyToken);

// 创建分类类型
router.post(
  "/",
  [rbac.checkPermission("manage_categories")],
  categoryTypeController.create
);

// 获取分类类型列表
router.get("/", categoryTypeController.findAll);

// 获取单个分类类型
router.get("/:id", categoryTypeController.findOne);

// 更新分类类型
router.put(
  "/:id",
  [rbac.checkPermission("manage_categories")],
  categoryTypeController.update
);

// 删除分类类型
router.delete(
  "/:id",
  [rbac.checkPermission("manage_categories")],
  categoryTypeController.delete
);

module.exports = router;
