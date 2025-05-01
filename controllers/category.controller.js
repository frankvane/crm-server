const { Category } = require("../models");
const ResponseUtil = require("../utils/response");

// 创建分类
exports.create = async (req, res, next) => {
  try {
    const { name, code, typeId, parentId, sort = 0, description } = req.body;

    // 检查必填字段
    if (!name || !code || !typeId) {
      return res
        .status(400)
        .json(ResponseUtil.error("Name, code and typeId are required", 400));
    }

    // 检查同类型下的code是否重复
    const existingCategory = await Category.findOne({
      where: { code, typeId },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json(
          ResponseUtil.error(
            "Category code already exists under the same type",
            400
          )
        );
    }

    const category = await Category.create({
      name,
      code,
      typeId,
      parentId,
      sort,
      description,
    });

    res
      .status(201)
      .json(ResponseUtil.success(category, "Category created successfully"));
  } catch (err) {
    next(err);
  }
};

// 获取分类列表
exports.list = async (req, res, next) => {
  try {
    const { typeId } = req.query;
    const where = {};
    if (typeId) {
      where.typeId = typeId;
    }
    const categories = await Category.findAll({
      where,
      order: [
        ["sort", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(ResponseUtil.success(categories));
  } catch (err) {
    next(err);
  }
};

// 获取分类树
exports.getTree = async (req, res, next) => {
  try {
    let { typeId } = req.query;
    typeId = typeId ? String(typeId) : "0"; // 确保 typeId 是字符串，undefined 转为 '0'

    // typeId 为 0 时，查全部分类
    const where = {};
    if (typeId !== "0") {
      where.typeId = typeId;
    }

    const categories = await Category.findAll({
      where,
      order: [
        ["sort", "ASC"],
        ["id", "ASC"],
      ],
    });

    // 构建树形结构
    const buildTree = (list, parentId = null) =>
      list
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          ...c.toJSON(),
          children: buildTree(list, c.id),
        }));

    const tree = buildTree(categories);
    res.json(ResponseUtil.success(tree));
  } catch (err) {
    next(err);
  }
};

// 更新分类
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, parentId, sort, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json(ResponseUtil.error("Category not found", 404));
    }

    // 如果要更新code，检查是否与其他分类冲突
    if (code && code !== category.code) {
      const existingCategory = await Category.findOne({
        where: { code, typeId: category.typeId },
      });

      if (existingCategory) {
        return res
          .status(400)
          .json(
            ResponseUtil.error(
              "Category code already exists under the same type",
              400
            )
          );
      }
    }

    // 更新字段
    if (name) category.name = name;
    if (code) category.code = code;
    if (typeof parentId !== "undefined") category.parentId = parentId;
    if (typeof sort !== "undefined") category.sort = sort;
    if (typeof description !== "undefined") category.description = description;

    await category.save();

    res.json(ResponseUtil.success(category, "Category updated successfully"));
  } catch (err) {
    next(err);
  }
};

// 删除分类
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json(ResponseUtil.error("Category not found", 404));
    }

    // 检查是否有子分类
    const childrenCount = await Category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("Cannot delete category with children", 400));
    }

    await category.destroy();
    res.json(ResponseUtil.success(null, "Category deleted successfully"));
  } catch (err) {
    next(err);
  }
};

// 获取单个分类
async function getById(req, res) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ code: 404, message: "Category not found", data: null });
    }
    res.json({ code: 200, message: "Success", data: category });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: "Internal server error", data: null });
  }
}

module.exports.getById = getById;
