const { User, Role } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// 创建用户
exports.create = async (req, res, next) => {
  try {
    const { username, password, email, roleIds } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 创建用户
    const user = await User.create({
      username,
      password, // 密码会在model的beforeCreate钩子中自动加密
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

    res.status(201).json(userWithRoles);
  } catch (err) {
    next(err);
  }
};

// 获取用户列表（支持分页和搜索）
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

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
      limit: parseInt(limit),
      distinct: true,
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows,
    });
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
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
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
      return res.status(404).json({ message: "User not found" });
    }

    // 如果要更新用户名，检查是否与其他用户冲突
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
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

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// 删除用户
exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
