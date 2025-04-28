const { Category } = require("../models");

exports.create = async (req, res, next) => {
  try {
    const { name, parentId, description } = req.body;
    const category = await Category.create({ name, parentId, description });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    // 组装树形结构
    const buildTree = (list, parentId = null) =>
      list
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          ...c.toJSON(),
          children: buildTree(list, c.id),
        }));
    res.json(buildTree(categories));
  } catch (err) {
    next(err);
  }
};
