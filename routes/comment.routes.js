const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");

/**
 * @swagger
 * /comment:
 *   post:
 *     tags:
 *       - 评论管理
 *     summary: 创建评论
 *     description: 新增一条评论。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 评论内容
 *               productId:
 *                 type: integer
 *                 description: 产品ID
 *     responses:
 *       200:
 *         description: 创建成功
 */
// 创建评论
router.post("/", commentController.create);
/**
 * @swagger
 * /comment:
 *   get:
 *     tags:
 *       - 评论管理
 *     summary: 获取评论列表
 *     description: 获取所有评论，支持分页。
 *     responses:
 *       200:
 *         description: 评论列表
 */
// 获取评论列表
router.get("/", commentController.list);
/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags:
 *       - 评论管理
 *     summary: 获取单个评论
 *     description: 根据ID获取评论详情。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 评论详情
 */
// 获取单个评论
router.get("/:id", commentController.findOne);
/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     tags:
 *       - 评论管理
 *     summary: 更新评论
 *     description: 根据ID更新评论内容。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 新评论内容
 *     responses:
 *       200:
 *         description: 更新成功
 */
// 更新评论
router.put("/:id", commentController.update);
/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags:
 *       - 评论管理
 *     summary: 删除评论
 *     description: 根据ID删除评论。
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除评论
router.delete("/:id", commentController.delete);
/**
 * @swagger
 * /comment/deleteMany:
 *   post:
 *     tags:
 *       - 评论管理
 *     summary: 批量删除评论
 *     description: 批量删除多个评论。
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
 *                 description: 评论ID数组
 *     responses:
 *       200:
 *         description: 批量删除成功
 */
// 批量删除评论
router.post("/deleteMany", commentController.deleteMany);

module.exports = router;
