const express = require("express");
const router = express.Router();
const resourceActionController = require("../controllers/resourceAction.controller");
const { authJwt } = require("../middlewares");

/**
 * @swagger
 * /resources/{resourceId}/actions:
 *   post:
 *     tags:
 *       - 资源操作管理
 *     summary: 创建资源操作
 *     description: 为指定资源创建操作。
 *     parameters:
 *       - in: path
 *         name: resourceId
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
 *                 description: 操作名称
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建资源操作
router.post(
  "/:resourceId/actions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:add")],
  resourceActionController.create
);

/**
 * @swagger
 * /resources/{resourceId}/actions:
 *   get:
 *     tags:
 *       - 资源操作管理
 *     summary: 获取资源操作列表
 *     description: 获取指定资源的所有操作。
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *     responses:
 *       200:
 *         description: 操作列表
 */
// 获取资源操作列表
router.get(
  "/:resourceId/actions",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceActionController.list
);

/**
 * @swagger
 * /resources/{resourceId}/actions/{id}:
 *   get:
 *     tags:
 *       - 资源操作管理
 *     summary: 获取单个资源操作
 *     description: 根据ID获取资源操作详情。
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 操作ID
 *     responses:
 *       200:
 *         description: 操作详情
 */
// 获取单个资源操作
router.get(
  "/:resourceId/actions/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceActionController.getById
);

/**
 * @swagger
 * /resources/{resourceId}/actions/{id}:
 *   put:
 *     tags:
 *       - 资源操作管理
 *     summary: 更新资源操作
 *     description: 根据ID更新资源操作信息。
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 操作ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 操作名称
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新资源操作
router.put(
  "/:resourceId/actions/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:edit")],
  resourceActionController.update
);

/**
 * @swagger
 * /resources/{resourceId}/actions/{id}:
 *   delete:
 *     tags:
 *       - 资源操作管理
 *     summary: 删除资源操作
 *     description: 根据ID删除资源操作。
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 资源ID
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 操作ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除资源操作
router.delete(
  "/:resourceId/actions/:id",
  [authJwt.verifyToken, authJwt.hasPermission("permission:resources:delete")],
  resourceActionController.delete
);

module.exports = router;
