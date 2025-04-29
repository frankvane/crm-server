const { User, Role } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");

// 创建用户
exports.create = async (req, res, next) => {
  try {
    const { username, password, email, roleIds } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res
        .status(400)
        .json(ResponseUtil.error("Username already exists", 400));
    }

    // 创建用户
    const user = await User.create({
      username,
      password,
      email,
      status: true,
    });

    // 如果提供了角色ID，则关联角色
    if (roleIds && roleIds.length > 0) {
      await user.setRoles(roleIds);
    }

    // 获取包含角色的完整用户信息
    const userWithRoles = await User.findByPk(user.id, {
      include: [{ model: Role, through: { attributes: [] } }],
      attributes: { exclude: ["password"] },
    });

    res
      .status(201)
      .json(ResponseUtil.success(userWithRoles, "User created successfully"));
  } catch (err) {
    next(err);
  }
};

// 获取用户列表（支持分页和搜索）
exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, search } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Role, through: { attributes: [] } }],
      attributes: { exclude: ["password"] },
      offset,
      limit: parseInt(pageSize),
      distinct: true,
    });

    res.json(
      ResponseUtil.page(rows, count, parseInt(page), parseInt(pageSize))
    );
  } catch (err) {
    next(err);
  }
};

// 获取单个用户
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, through: { attributes: [] } }],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    res.json(ResponseUtil.success(user));
  } catch (err) {
    next(err);
  }
};

// 更新用户
exports.update = async (req, res, next) => {
  try {
    const { username, email, password, roleIds, status } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    // 如果要更新用户名，检查是否与其他用户冲突
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res
          .status(400)
          .json(ResponseUtil.error("Username already exists", 400));
      }
      user.username = username;
    }

    // 更新其他字段
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (typeof status !== "undefined") user.status = status;

    await user.save();

    // 如果提供了角色ID，则更新角色
    if (roleIds) {
      await user.setRoles(roleIds);
    }

    // 获取更新后的用户信息（包含角色）
    const updatedUser = await User.findByPk(user.id, {
      include: [{ model: Role, through: { attributes: [] } }],
      attributes: { exclude: ["password"] },
    });

    res.json(ResponseUtil.success(updatedUser, "User updated successfully"));
  } catch (err) {
    next(err);
  }
};

// 删除用户
exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    await user.destroy();
    res.json(ResponseUtil.success(null, "User deleted successfully"));
  } catch (err) {
    next(err);
  }
};
