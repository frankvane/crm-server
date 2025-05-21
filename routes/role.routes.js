const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { authJwt } = require("../middlewares");

/**
 * @swagger
 * /roles:
 *   post:
 *     tags:
 *       - 角色管理
 *     summary: 创建角色
 *     description: 新增一个角色。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建角色
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:add")],
  roleController.create
);

/**
 * @swagger
 * /roles/all:
 *   get:
 *     tags:
 *       - 角色管理
 *     summary: 获取所有角色
 *     description: 获取所有角色（不分页）。
 *     responses:
 *       200:
 *         description: 角色列表
 */
// 获取所有角色（不分页）
router.get(
  "/all",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.listAll
);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags:
 *       - 角色管理
 *     summary: 获取角色列表
 *     description: 获取所有角色，支持分页。
 *     responses:
 *       200:
 *         description: 角色列表
 */
// 获取角色列表
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.list
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags:
 *       - 角色管理
 *     summary: 获取单个角色
 *     description: 根据ID获取角色详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 角色详情
 */
// 获取单个角色
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.detail
);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags:
 *       - 角色管理
 *     summary: 更新角色
 *     description: 根据ID更新角色信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新角色
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.update
);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags:
 *       - 角色管理
 *     summary: 删除角色
 *     description: 根据ID删除角色。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除角色
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:delete")],
  roleController.delete
);

/**
 * @swagger
 * /roles/{id}/toggle-status:
 *   put:
 *     tags:
 *       - 角色管理
 *     summary: 切换角色状态
 *     description: 启用或禁用角色。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 切换成功
 *   patch:
 *     tags:
 *       - 角色管理
 *     summary: 切换角色状态
 *     description: 启用或禁用角色。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 切换成功
 */
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

/**
 * @swagger
 * /roles/{roleId}/resources:
 *   post:
 *     tags:
 *       - 角色管理
 *     summary: 分配资源
 *     description: 为指定角色分配资源。
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 资源ID数组
 *     responses:
 *       200:
 *         description: 分配成功
 */
// 分配资源
router.post(
  "/:roleId/resources",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.assignResources
);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   post:
 *     tags:
 *       - 角色管理
 *     summary: 分配权限
 *     description: 为指定角色分配权限。
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 权限ID数组
 *     responses:
 *       200:
 *         description: 分配成功
 */
// 分配权限
router.post(
  "/:roleId/permissions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.assignPermissions
);

/**
 * @swagger
 * /roles/{id}/resources:
 *   get:
 *     tags:
 *       - 角色管理
 *     summary: 获取指定角色的资源列表
 *     description: 获取指定角色的资源列表。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 资源列表
 */
// 获取指定角色的资源列表
router.get(
  "/:id/resources",
  [authJwt.verifyToken, authJwt.hasPermission("permission:roles:edit")],
  roleController.getResources
);

module.exports = router;
