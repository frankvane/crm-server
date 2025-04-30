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
      include: [{ model: Role, as: "Roles", through: { attributes: [] } }],
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
      include: [{ model: Role, as: "Roles", through: { attributes: [] } }],
      attributes: { exclude: ["password"] },
      offset,
      limit: parseInt(pageSize),
      distinct: true,
    });

    // 格式化用户数据
    const formattedUsers = rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status ? 1 : 0, // 将布尔值转换为数字
      roles: user.Roles.map((role) => ({
        id: role.id,
        name: role.name,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // 构建分页响应
    const response = {
      list: formattedUsers,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
      },
    };

    res.json(ResponseUtil.success(response));
  } catch (err) {
    next(err);
  }
};

// 获取单个用户
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: "Roles", through: { attributes: [] } }],
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
      include: [{ model: Role, as: "Roles", through: { attributes: [] } }],
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

// 修改用户密码
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // 检查是否是用户本人修改密码，或者是管理员
    const isAdmin =
      req.user.roles && req.user.roles.some((role) => role.name === "admin");
    const isSelfUpdate = req.user.id === parseInt(userId);

    if (!isAdmin && !isSelfUpdate) {
      return res
        .status(403)
        .json(ResponseUtil.error("You can only change your own password", 403));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    // 如果是用户本人修改，需要验证当前密码
    if (isSelfUpdate && currentPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json(ResponseUtil.error("Current password is incorrect", 400));
      }
    }

    // 更新密码
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json(ResponseUtil.success(null, "Password changed successfully"));
  } catch (err) {
    next(err);
  }
};

// 切换用户状态（启用/禁用）
exports.toggleStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    // 切换状态
    user.status = !user.status;
    await user.save();

    const statusMessage = user.status ? "enabled" : "disabled";
    res.json(
      ResponseUtil.success(
        { id: user.id, status: user.status },
        `User ${statusMessage} successfully`
      )
    );
  } catch (err) {
    next(err);
  }
};

// 批量删除用户
exports.batchDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("Invalid user IDs provided", 400));
    }

    // 批量删除
    const result = await User.destroy({
      where: { id: { [Op.in]: ids } },
    });

    res.json(
      ResponseUtil.success(
        { deletedCount: result },
        `${result} users deleted successfully`
      )
    );
  } catch (err) {
    next(err);
  }
};
