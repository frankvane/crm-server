const { CategoryType } = require("../models");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");

// 创建分类类型
exports.create = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    // 检查code是否已存在
    const existingCode = await CategoryType.findOne({ where: { code } });
    if (existingCode) {
      return res
        .status(400)
        .json(ResponseUtil.error("Category type code already exists", 400));
    }

    // 检查name是否已存在
    const existingName = await CategoryType.findOne({ where: { name } });
    if (existingName) {
      return res
        .status(400)
        .json(ResponseUtil.error("Category type name already exists", 400));
    }

    const categoryType = await CategoryType.create({
      name,
      code,
      description,
      status: status !== undefined ? status : true,
    });

    res
      .status(201)
      .json(
        ResponseUtil.success(categoryType, "Category type created successfully")
      );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json(
          ResponseUtil.error("Category type name or code must be unique", 400)
        );
    }
    console.error("Error creating category type:", error);
    res.status(500).json(ResponseUtil.error("Internal server error", 500));
  }
};

// 获取分类类型列表
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      name,
      code,
      description,
    } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    // 状态查询
    if (status !== undefined) {
      where.status = status === "true";
    }

    // 关键字搜索（支持名称、代码、描述模糊查询）
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // 指定字段搜索
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }
    if (description) {
      where.description = { [Op.like]: `%${description}%` };
    }

    const { count, rows } = await CategoryType.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
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
    console.error("Error getting category types:", error);
    res.status(500).json(ResponseUtil.error("Internal server error", 500));
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

    // 获取关联的分类
    const categories = await categoryType.getCategories();

    // 开启事务以确保数据一致性
    const t = await CategoryType.sequelize.transaction();

    try {
      // 先删除所有关联的分类
      if (categories.length > 0) {
        await Promise.all(
          categories.map((category) => category.destroy({ transaction: t }))
        );
      }

      // 然后删除分类类型
      await categoryType.destroy({ transaction: t });

      // 提交事务
      await t.commit();

      res.json({
        code: 200,
        message: "Category type and associated categories deleted successfully",
        data: null,
      });
    } catch (error) {
      // 如果出错，回滚事务
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting category type:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// 获取所有分类类型（不分页）
exports.listAll = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status !== undefined) {
      where.status = status === "true";
    }
    const categoryTypes = await CategoryType.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    res.json(ResponseUtil.success(categoryTypes));
  } catch (error) {
    console.error("Error getting all category types:", error);
    res.status(500).json(ResponseUtil.error("Internal server error", 500));
  }
};
