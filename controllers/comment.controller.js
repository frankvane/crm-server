const { Comment } = require("../models");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");

// 创建评论
exports.create = async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).json(ResponseUtil.success(comment, "评论创建成功"));
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取评论列表
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      search,
      content,
      product_id,
      user_id,
      status,
    } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (status !== undefined) where.status = status;
    if (product_id) where.product_id = product_id;
    if (user_id) where.user_id = user_id;
    if (search) {
      where[Op.or] = [{ content: { [Op.like]: `%${search}%` } }];
    }
    if (content) where.content = { [Op.like]: `%${content}%` };
    const { count, rows } = await Comment.findAndCountAll({
      where,
      offset: Number(offset),
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
    });
    const response = {
      list: rows,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
      },
    };
    res.json(ResponseUtil.success(response));
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取单个评论
exports.findOne = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json(ResponseUtil.error("未找到评论", 404));
    }
    res.json(ResponseUtil.success(comment));
  } catch (error) {
    console.error("Error getting comment:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 更新评论
exports.update = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json(ResponseUtil.error("未找到评论", 404));
    }
    await comment.update(req.body);
    res.json(ResponseUtil.success(comment, "评论更新成功"));
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 删除评论
exports.delete = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json(ResponseUtil.error("未找到评论", 404));
    }
    await comment.destroy();
    res.json(ResponseUtil.success(null, "评论删除成功"));
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 批量删除评论
exports.deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("参数ids不能为空数组", 400));
    }
    const count = await Comment.destroy({ where: { id: ids } });
    res.json(ResponseUtil.success({ deleted: count }, "批量删除成功"));
  } catch (error) {
    console.error("Error batch deleting comments:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};
