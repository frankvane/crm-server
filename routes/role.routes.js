const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { authJwt } = require("../middlewares");

// 创建角色
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("system:role:add")],
  roleController.createRole
);

// 获取角色列表
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("system:role:edit")],
  roleController.getRoles
);

// 获取单个角色
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:role:edit")],
  roleController.getRole
);

// 更新角色
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:role:edit")],
  roleController.updateRole
);

// 删除角色
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("system:role:delete")],
  roleController.deleteRole
);

// 切换角色状态
router
  .route("/:id/toggle-status")
  .put(
    [authJwt.verifyToken, authJwt.hasPermission("system:role:edit")],
    roleController.toggleStatus
  )
  .patch(
    [authJwt.verifyToken, authJwt.hasPermission("system:role:edit")],
    roleController.toggleStatus
  );

module.exports = router;
