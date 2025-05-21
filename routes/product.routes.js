const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

/**
 * @swagger
 * /product:
 *   post:
 *     tags:
 *       - 产品管理
 *     summary: 创建产品
 *     description: 新增一个产品。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 产品名称
 *               price:
 *                 type: number
 *                 description: 产品价格
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建产品
router.post("/", productController.create);
/**
 * @swagger
 * /product:
 *   get:
 *     tags:
 *       - 产品管理
 *     summary: 获取产品列表
 *     description: 获取所有产品，支持分页。
 *     responses:
 *       200:
 *         description: 产品列表
 */
// 获取产品列表
router.get("/", productController.list);
/**
 * @swagger
 * /product/{id}:
 *   get:
 *     tags:
 *       - 产品管理
 *     summary: 获取单个产品
 *     description: 根据ID获取产品详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 产品ID
 *     responses:
 *       200:
 *         description: 产品详情
 */
// 获取单个产品
router.get("/:id", productController.findOne);
/**
 * @swagger
 * /product/{id}:
 *   put:
 *     tags:
 *       - 产品管理
 *     summary: 更新产品
 *     description: 根据ID更新产品信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 产品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 产品名称
 *               price:
 *                 type: number
 *                 description: 产品价格
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新产品
router.put("/:id", productController.update);
/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     tags:
 *       - 产品管理
 *     summary: 删除产品
 *     description: 根据ID删除产品。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 产品ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除产品
router.delete("/:id", productController.delete);
/**
 * @swagger
 * /product/deleteMany:
 *   post:
 *     tags:
 *       - 产品管理
 *     summary: 批量删除产品
 *     description: 批量删除多个产品。
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
 *                 description: 产品ID数组
 *     responses:
 *       200:
 *         description: 批量删除成功
 */
// 批量删除产品
router.post("/deleteMany", productController.deleteMany);

module.exports = router;
