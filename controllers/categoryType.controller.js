const { CategoryType } = require("../models");
const { Op } = require("sequelize");

// 创建分类类型
exports.create = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    // 检查code是否已存在
    const existing = await CategoryType.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: "Category type code already exists",
        data: null,
      });
    }

    const categoryType = await CategoryType.create({
      name,
      code,
      description,
      status: status !== undefined ? status : true,
    });

    res.json({
      code: 200,
      message: "Category type created successfully",
      data: categoryType,
    });
  } catch (error) {
    console.error("Error creating category type:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// 获取分类类型列表
exports.findAll = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (status !== undefined) {
      where.status = status === "true";
    }

    const { count, rows } = await CategoryType.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      code: 200,
      message: "Success",
      data: {
        total: count,
        items: rows,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error("Error getting category types:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// 获取单个分类类型
exports.findOne = async (req, res) => {
  try {
    const categoryType = await CategoryType.findByPk(req.params.id);
    if (!categoryType) {
      return res.status(404).json({
        code: 404,
        message: "Category type not found",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "Success",
      data: categoryType,
    });
  } catch (error) {
    console.error("Error getting category type:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// 更新分类类型
exports.update = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    const categoryType = await CategoryType.findByPk(req.params.id);

    if (!categoryType) {
      return res.status(404).json({
        code: 404,
        message: "Category type not found",
        data: null,
      });
    }

    // 如果要更改code，检查新code是否已存在
    if (code && code !== categoryType.code) {
      const existing = await CategoryType.findOne({
        where: {
          code,
          id: { [Op.ne]: req.params.id },
        },
      });
      if (existing) {
        return res.status(400).json({
          code: 400,
          message: "Category type code already exists",
          data: null,
        });
      }
    }

    await categoryType.update({
      name: name || categoryType.name,
      code: code || categoryType.code,
      description:
        description !== undefined ? description : categoryType.description,
      status: status !== undefined ? status : categoryType.status,
    });

    res.json({
      code: 200,
      message: "Category type updated successfully",
      data: categoryType,
    });
  } catch (error) {
    console.error("Error updating category type:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// 删除分类类型
exports.delete = async (req, res) => {
  try {
    const categoryType = await CategoryType.findByPk(req.params.id);
    if (!categoryType) {
      return res.status(404).json({
        code: 404,
        message: "Category type not found",
        data: null,
      });
    }

    // TODO: 检查是否有关联的分类，如果有则不允许删除
    const categories = await categoryType.getCategories();
    if (categories.length > 0) {
      return res.status(400).json({
        code: 400,
        message: "Cannot delete category type with associated categories",
        data: null,
      });
    }

    await categoryType.destroy();
    res.json({
      code: 200,
      message: "Category type deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting category type:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
