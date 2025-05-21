const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");
const resourceActionRoutes = require("./resourceAction.routes");
const { authJwt } = require("../middlewares");

// 资源操作相关路由
router.use("/", resourceActionRoutes);

/**
 * @swagger
 * /resources/tree:
 *   get:
 *     tags:
 *       - 资源管理
 *     summary: 获取资源树
 *     description: 获取资源树结构。
 *     responses:
 *       200:
 *         description: 资源树
 */
// 获取资源树
router.get(
  "/tree",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.tree
);

/**
 * @swagger
 * /resources/tree-with-actions:
 *   get:
 *     tags:
 *       - 资源管理
 *     summary: 获取资源树及其下所有按钮权限
 *     description: 获取资源树及其下所有按钮权限。
 *     responses:
 *       200:
 *         description: 资源树及按钮权限
 */
// 获取资源树及其下所有按钮权限
router.get(
  "/tree-with-actions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.treeWithActions
);

/**
 * @swagger
 * /resources:
 *   post:
 *     tags:
 *       - 资源管理
 *     summary: 创建资源
 *     description: 新增一个资源。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 资源名称
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建资源
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:add")],
  resourceController.create
);

/**
 * @swagger
 * /resources:
 *   get:
 *     tags:
 *       - 资源管理
 *     summary: 获取资源列表
 *     description: 获取所有资源，支持分页。
 *     responses:
 *       200:
 *         description: 资源列表
 */
// 获取资源列表
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.list
);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     tags:
 *       - 资源管理
 *     summary: 获取单个资源
 *     description: 根据ID获取资源详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *     responses:
 *       200:
 *         description: 资源详情
 */
// 获取单个资源
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.getById
);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     tags:
 *       - 资源管理
 *     summary: 更新资源
 *     description: 根据ID更新资源信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 资源名称
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新资源
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceController.update
);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     tags:
 *       - 资源管理
 *     summary: 删除资源
 *     description: 根据ID删除资源。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除资源
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:delete")],
  resourceController.delete
);

module.exports = router;
