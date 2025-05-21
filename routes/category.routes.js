const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authJwt } = require("../middlewares");

/**
 * @swagger
 * /categories:
 *   post:
 *     tags:
 *       - 分类管理
 *     summary: 创建分类
 *     description: 新增一个分类。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建分类
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:add")],
  categoryController.create
);

/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *       - 分类管理
 *     summary: 获取分类列表
 *     description: 获取所有分类，支持分页。
 *     responses:
 *       200:
 *         description: 分类列表
 */
// 获取分类列表
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:view")],
  categoryController.list
);

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     tags:
 *       - 分类管理
 *     summary: 获取分类树
 *     description: 获取分类树结构。
 *     responses:
 *       200:
 *         description: 分类树
 */
// 获取分类树
router.get(
  "/tree",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:view")],
  categoryController.getTree
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags:
 *       - 分类管理
 *     summary: 获取单个分类
 *     description: 根据ID获取分类详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 分类详情
 */
// 获取单个分类
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:view")],
  categoryController.getById
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags:
 *       - 分类管理
 *     summary: 更新分类
 *     description: 根据ID更新分类信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 分类ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新分类
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:edit")],
  categoryController.update
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags:
 *       - 分类管理
 *     summary: 删除分类
 *     description: 根据ID删除分类。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除分类
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:categories:delete")],
  categoryController.delete
);

module.exports = router;
