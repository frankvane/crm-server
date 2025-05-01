const { User, Role } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");
const { sequelize } = require("../models");

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
      status: 1,
    });

    // 如果提供了角色ID，则关联角色
    if (roleIds && roleIds.length > 0) {
      await user.setRoles(roleIds);
    }

    // 获取包含角色的完整用户信息
    const userWithRoles = await User.findByPk(user.id, {
      include: [{ model: Role, as: "roles", through: { attributes: [] } }],
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
    const {
      page = 1,
      pageSize = 10,
      search,
      username,
      email,
      status,
      roleId,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const where = {};

    // 状态查询
    if (status !== undefined) {
      where.status = status === "true" || status === "1" ? 1 : 0;
    }

    // 关键字搜索（支持用户名、邮箱的模糊查询）
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // 指定字段搜索
    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }

    // 构建查询选项
    const queryOptions = {
      where,
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
          // 如果指定了角色ID，只查询具有该角色的用户
          ...(roleId && {
            where: { id: roleId },
          }),
        },
      ],
      attributes: { exclude: ["password"] },
      offset,
      limit: parseInt(pageSize),
      distinct: true,
      order: [["createdAt", "DESC"]],
    };

    const { count, rows } = await User.findAndCountAll(queryOptions);

    // 格式化用户数据
    const formattedUsers = rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
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
      include: [{ model: Role, as: "roles", through: { attributes: [] } }],
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
      include: [{ model: Role, as: "roles", through: { attributes: [] } }],
      attributes: { exclude: ["password"] },
    });

    res.json(ResponseUtil.success(updatedUser, "User updated successfully"));
  } catch (err) {
    next(err);
  }
};

// 删除用户
exports.delete = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      await transaction.rollback();
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    // First delete related records
    await user.setRoles([], { transaction });
    await user.setRefreshTokens([], { transaction });

    // Then delete the user
    await user.destroy({ transaction });

    await transaction.commit();
    res.json(ResponseUtil.success(null, "User deleted successfully"));
  } catch (err) {
    await transaction.rollback();
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
  const transaction = await sequelize.transaction();
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      await transaction.rollback();
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    // 切换状态
    user.status = user.status === 1 ? 0 : 1;
    await user.save({ transaction });

    await transaction.commit();
    const statusMessage = user.status === 1 ? "enabled" : "disabled";
    res.json(
      ResponseUtil.success(
        { id: user.id, status: user.status },
        `User ${statusMessage} successfully`
      )
    );
  } catch (err) {
    await transaction.rollback();
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

// 获取当前登录用户信息（含角色、菜单、按钮权限）
exports.me = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      User,
      Role,
      Permission,
      Resource,
      ResourceAction,
    } = require("../models");

    // 查询用户及角色
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: Permission,
              as: "permissions",
            },
            {
              model: Resource,
              as: "resources",
              include: [
                {
                  model: ResourceAction,
                  as: "actions",
                  include: [
                    {
                      model: Permission,
                      as: "permission",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json(ResponseUtil.error("User not found", 404));
    }

    // 构建用户信息响应
    const response = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
      },
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          code: permission.code,
        })),
      })),
      resources: user.roles.reduce((acc, role) => {
        role.resources.forEach((resource) => {
          if (!acc.find((r) => r.id === resource.id)) {
            acc.push({
              id: resource.id,
              name: resource.name,
              code: resource.code,
              type: resource.type,
              path: resource.path,
              component: resource.component,
              meta: resource.meta,
              actions: resource.actions.map((action) => ({
                id: action.id,
                name: action.name,
                code: action.code,
                icon: action.icon,
                needConfirm: action.needConfirm,
                confirmMessage: action.confirmMessage,
                permission: action.permission
                  ? {
                      id: action.permission.id,
                      name: action.permission.name,
                      code: action.permission.code,
                    }
                  : null,
              })),
            });
          }
        });
        return acc;
      }, []),
    };

    res.json(ResponseUtil.success(response));
  } catch (err) {
    next(err);
  }
};
