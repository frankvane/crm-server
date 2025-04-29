const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { authenticateToken, checkPermission } = require("../middlewares/auth");

// 创建角色
router.post(
  "/",
  authenticateToken,
  checkPermission("manage_roles"),
  roleController.createRole
);

// 获取角色列表
router.get(
  "/",
  authenticateToken,
  checkPermission("view_roles"),
  roleController.getRoles
);

// 获取单个角色
router.get(
  "/:id",
  authenticateToken,
  checkPermission("view_roles"),
  roleController.getRole
);

// 更新角色
router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_roles"),
  roleController.updateRole
);

// 删除角色
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("manage_roles"),
  roleController.deleteRole
);

module.exports = router;
