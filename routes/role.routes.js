const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { verifyToken, hasPermission } = require("../middlewares/auth");

// 创建角色
router.post(
  "/",
  [verifyToken, hasPermission("manage_roles")],
  roleController.createRole
);

// 获取角色列表
router.get(
  "/",
  [verifyToken, hasPermission("view_roles")],
  roleController.getRoles
);

// 获取单个角色
router.get(
  "/:id",
  [verifyToken, hasPermission("view_roles")],
  roleController.getRole
);

// 更新角色
router.put(
  "/:id",
  [verifyToken, hasPermission("manage_roles")],
  roleController.updateRole
);

// 删除角色
router.delete(
  "/:id",
  [verifyToken, hasPermission("manage_roles")],
  roleController.deleteRole
);

module.exports = router;
