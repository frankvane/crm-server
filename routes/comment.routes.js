const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");

// 创建评论
router.post("/", commentController.create);
// 获取评论列表
router.get("/", commentController.list);
// 获取单个评论
router.get("/:id", commentController.findOne);
// 更新评论
router.put("/:id", commentController.update);
// 删除评论
router.delete("/:id", commentController.delete);
// 批量删除评论
router.post("/deleteMany", commentController.deleteMany);

module.exports = router;
