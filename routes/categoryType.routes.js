const express = require("express");
const router = express.Router();
const categoryTypeController = require("../controllers/categoryType.controller");
const { authJwt } = require("../middlewares");

/**
 * @swagger
 * /category-types:
 *   post:
 *     tags:
 *       - 分类类型管理
 *     summary: 创建分类类型
 *     description: 新增一个分类类型。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类类型名称
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建分类类型
router.post(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:category-types:add")],
  categoryTypeController.create
);

/**
 * @swagger
 * /category-types:
 *   get:
 *     tags:
 *       - 分类类型管理
 *     summary: 获取分类类型列表
 *     description: 获取所有分类类型，支持分页。
 *     responses:
 *       200:
 *         description: 分类类型列表
 */
// 获取分类类型列表
router.get(
  "/",
  [authJwt.verifyToken, authJwt.hasPermission("category:category-types:view")],
  categoryTypeController.list
);

/**
 * @swagger
 * /category-types/all:
 *   get:
 *     tags:
 *       - 分类类型管理
 *     summary: 获取所有分类类型
 *     description: 获取所有分类类型（不分页）。
 *     responses:
 *       200:
 *         description: 分类类型列表
 */
// 获取所有分类类型（不分页）
router.get(
  "/all",
  [authJwt.verifyToken, authJwt.hasPermission("category:category-types:view")],
  categoryTypeController.listAll
);

/**
 * @swagger
 * /category-types/{id}:
 *   get:
 *     tags:
 *       - 分类类型管理
 *     summary: 获取单个分类类型
 *     description: 根据ID获取分类类型详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 分类类型ID
 *     responses:
 *       200:
 *         description: 分类类型详情
 */
// 获取单个分类类型
router.get(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:category-types:view")],
  categoryTypeController.findOne
);

/**
 * @swagger
 * /category-types/{id}:
 *   put:
 *     tags:
 *       - 分类类型管理
 *     summary: 更新分类类型
 *     description: 根据ID更新分类类型信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 分类类型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类类型名称
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新分类类型
router.put(
  "/:id",
  [authJwt.verifyToken, authJwt.hasPermission("category:category-types:edit")],
  categoryTypeController.update
);

/**
 * @swagger
 * /category-types/{id}:
 *   delete:
 *     tags:
 *       - 分类类型管理
 *     summary: 删除分类类型
 *     description: 根据ID删除分类类型。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 分类类型ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除分类类型
router.delete(
  "/:id",
  [
    authJwt.verifyToken,
    authJwt.hasPermission("category:category-types:delete"),
  ],
  categoryTypeController.delete
);

module.exports = router;
