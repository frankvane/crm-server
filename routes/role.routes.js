const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { authJwt } = require("../middlewares");

// 创建角色
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:add")],
  roleController.create
);

// 获取所有角色（不分页）
router.get(
  "/all",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.listAll
);

// 获取角色列表
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.list
);

// 获取单个角色
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.detail
);

// 更新角色
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.update
);

// 删除角色
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:delete")],
  roleController.delete
);

// 切换角色状态
router
  .route("/:id/toggle-status")
  .put(
    [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
    roleController.toggleStatus
  )
  .patch(
    [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
    roleController.toggleStatus
  );

// 分配资源
router.post(
  "/:roleId/resources",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.assignResources
);

// 分配权限
router.post(
  "/:roleId/permissions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.assignPermissions
);

// 获取指定角色的资源列表
router.get(
  "/:id/resources",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.getResources
);

module.exports = router;
