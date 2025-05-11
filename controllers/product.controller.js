const { Product } = require("../models");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");

// 创建产品
exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const product = await Product.create(req.body);
    res.status(201).json(ResponseUtil.success(product, "产品创建成功"));
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取产品列表
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      search,
      name,
      code,
      status,
      category_id,
    } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (status !== undefined) where.status = status;
    if (category_id) where.category_id = category_id;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { manufacturer: { [Op.like]: `%${search}%` } },
      ];
    }
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (code) where.code = { [Op.like]: `%${code}%` };
    const { count, rows } = await Product.findAndCountAll({
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
    console.error("Error getting products:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取单个产品
exports.findOne = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json(ResponseUtil.error("未找到产品", 404));
    }
    res.json(ResponseUtil.success(product));
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 更新产品
exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json(ResponseUtil.error("未找到产品", 404));
    }
    await product.update(req.body);
    res.json(ResponseUtil.success(product, "产品更新成功"));
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 删除产品
exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json(ResponseUtil.error("未找到产品", 404));
    }
    await product.destroy();
    res.json(ResponseUtil.success(null, "产品删除成功"));
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 批量删除产品
exports.deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("参数ids不能为空数组", 400));
    }
    const count = await Product.destroy({ where: { id: ids } });
    res.json(ResponseUtil.success({ deleted: count }, "批量删除成功"));
  } catch (error) {
    console.error("Error batch deleting products:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};
