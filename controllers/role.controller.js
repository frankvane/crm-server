const { Role, Permission } = require("../models");
const { sendResponse } = require("../utils/response");

// 创建角色
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;

    // 检查角色名是否已存在
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return sendResponse(res, 400, "角色名已存在");
    }

    // 创建角色
    const role = await Role.create({ name, description });

    // 如果提供了权限ID，关联权限
    if (permissionIds && permissionIds.length > 0) {
      await role.setPermissions(permissionIds);
    }

    // 获取完整的角色信息（包含权限）
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: "Permissions",
          attributes: ["id", "name", "action", "resource"],
          through: { attributes: [] },
        },
      ],
    });

    return sendResponse(res, 200, "角色创建成功", roleWithPermissions);
  } catch (error) {
    console.error("创建角色失败:", error);
    return sendResponse(res, 500, "创建角色失败");
  }
};

// 获取角色列表
exports.getRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Role.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Permission,
          as: "Permissions",
          attributes: ["id", "name", "action", "resource"],
          through: { attributes: [] },
        },
      ],
    });

    return sendResponse(res, 200, "获取角色列表成功", {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    return sendResponse(res, 500, "获取角色列表失败");
  }
};

// 获取单个角色
exports.getRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: "Permissions",
          attributes: ["id", "name", "action", "resource"],
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      return sendResponse(res, 404, "角色不存在");
    }

    return sendResponse(res, 200, "获取角色成功", role);
  } catch (error) {
    console.error("获取角色失败:", error);
    return sendResponse(res, 500, "获取角色失败");
  }
};

// 更新角色
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return sendResponse(res, 404, "角色不存在");
    }

    // 检查新角色名是否与其他角色重复
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return sendResponse(res, 400, "角色名已存在");
      }
    }

    // 更新角色信息
    await role.update({ name, description });

    // 如果提供了权限ID，更新权限关联
    if (permissionIds) {
      await role.setPermissions(permissionIds);
    }

    // 获取更新后的完整角色信息
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: "Permissions",
          attributes: ["id", "name", "action", "resource"],
          through: { attributes: [] },
        },
      ],
    });

    return sendResponse(res, 200, "角色更新成功", updatedRole);
  } catch (error) {
    console.error("更新角色失败:", error);
    return sendResponse(res, 500, "更新角色失败");
  }
};

// 删除角色
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return sendResponse(res, 404, "角色不存在");
    }

    // 检查角色是否有关联的用户
    const userCount = await role.countUsers();
    if (userCount > 0) {
      return sendResponse(res, 400, "无法删除，该角色下存在用户");
    }

    await role.destroy();
    return sendResponse(res, 200, "角色删除成功");
  } catch (error) {
    console.error("删除角色失败:", error);
    return sendResponse(res, 500, "删除角色失败");
  }
};
