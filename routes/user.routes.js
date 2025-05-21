const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authJwt } = require("../middlewares");

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - 用户管理
 *     summary: 获取当前登录用户信息
 *     description: 获取当前登录用户的详细信息，包括角色、菜单、按钮权限。
 *     responses:
 *       200:
 *         description: 用户信息
 */
// 获取当前登录用户信息（含角色、菜单、按钮权限）
router.get("/me", [authJwt.verifyToken], userController.me);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - 用户管理
 *     summary: 创建用户
 *     description: 新增一个用户。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建用户（使用已存在的权限）
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:add")],
  userController.create
);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - 用户管理
 *     summary: 获取用户列表
 *     description: 获取所有用户，支持分页。
 *     responses:
 *       200:
 *         description: 用户列表
 */
// 获取用户列表（修改为使用已存在的权限，如编辑权限）
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:edit")],
  userController.list
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - 用户管理
 *     summary: 获取单个用户
 *     description: 根据ID获取用户详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 用户详情
 */
// 获取单个用户（修改为使用已存在的权限，如编辑权限）
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:edit")],
  userController.getById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - 用户管理
 *     summary: 更新用户
 *     description: 根据ID更新用户信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新用户
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:edit")],
  userController.update
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - 用户管理
 *     summary: 删除用户
 *     description: 根据ID删除用户。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除用户
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:delete")],
  userController.delete
);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     tags:
 *       - 用户管理
 *     summary: 修改用户密码
 *     description: 修改指定用户的密码。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: 新密码
 *     responses:
 *       200:
 *         description: 修改成功
 */
// 修改用户密码
router.put(
  "/:id/password",
  [authJwt.verifyToken],
  userController.changePassword
);

/**
 * @swagger
 * /users/{id}/toggle-status:
 *   put:
 *     tags:
 *       - 用户管理
 *     summary: 切换用户状态
 *     description: 启用或禁用用户。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 切换成功
 *   patch:
 *     tags:
 *       - 用户管理
 *     summary: 切换用户状态
 *     description: 启用或禁用用户。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 切换成功
 */
// 切换用户状态
router
  .route("/:id/toggle-status")
  .put(
    [authJwt.verifyToken, authJwt.hasPermission("permission:users:edit")],
    userController.toggleStatus
  )
  .patch(
    [authJwt.verifyToken, authJwt.hasPermission("permission:users:edit")],
    userController.toggleStatus
  );

/**
 * @swagger
 * /users/{id}/roles:
 *   post:
 *     tags:
 *       - 用户管理
 *     summary: 分配角色
 *     description: 为指定用户分配角色。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 角色ID数组
 *     responses:
 *       200:
 *         description: 分配成功
 */
// 分配角色
router.post(
  "/:id/roles",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:edit")],
  userController.assignRoles
);

/**
 * @swagger
 * /users/batch:
 *   delete:
 *     tags:
 *       - 用户管理
 *     summary: 批量删除用户
 *     description: 批量删除多个用户。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 用户ID数组
 *     responses:
 *       200:
 *         description: 批量删除成功
 */
// 批量删除用户
router.delete(
  "/batch",
  [authJwt.verifyToken, authJwt.hasPermission("permission:users:delete")],
  userController.batchDelete
);

module.exports = router;
