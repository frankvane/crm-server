const {
  Role,
  Permission,
  RoleResource,
  ResourceAction,
  RolePermission,
  Resource,
  sequelize,
} = require("../models");
const ResponseUtil = require("../utils/response");
const { Op } = require("sequelize");

const roleController = {
  // 创建角色
  create: async (req, res) => {
    try {
      const { name, code, description, permissionIds } = req.body;

      // 检查角色名是否已存在
      const existingRole = await Role.findOne({
        where: {
          [Op.or]: [{ name }, { code }],
        },
      });
      if (existingRole) {
        return res
          .status(400)
          .json(ResponseUtil.error("角色名或编码已存在", 400));
      }

      // 创建角色
      const role = await Role.create({ name, code, description });

      // 如果提供了权限ID，关联权限
      if (permissionIds && permissionIds.length > 0) {
        await role.setPermissions(permissionIds);
      }

      // 获取完整的角色信息（包含权限）
      const roleWithPermissions = await Role.findByPk(role.id, {
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
        ],
      });

      return res
        .status(200)
        .json(ResponseUtil.success(roleWithPermissions, "角色创建成功"));
    } catch (error) {
      console.error("创建角色失败:", error);
      return res.status(500).json(ResponseUtil.error("创建角色失败", 500));
    }
  },

  // 获取角色列表
  list: async (req, res) => {
    try {
      const { page = 1, pageSize = 10, search, name, code, status } = req.query;
      const offset = (page - 1) * pageSize;

      const where = {};

      // 构建查询条件
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      // 特定字段搜索
      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }
      if (code) {
        where.code = { [Op.like]: `%${code}%` };
      }
      if (status !== undefined) {
        where.status = status === "true" || status === "1" ? 1 : 0;
      }

      const { count, rows } = await Role.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: parseInt(offset),
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
          {
            model: Resource,
            as: "resources",
            through: { attributes: [] },
          },
        ],
        distinct: true, // 关键点
        order: [["createdAt", "DESC"]],
      });

      return res
        .status(200)
        .json(
          ResponseUtil.page(rows, count, parseInt(page), parseInt(pageSize))
        );
    } catch (error) {
      console.error("获取角色列表失败:", error);
      return res.status(500).json(ResponseUtil.error("获取角色列表失败", 500));
    }
  },

  // 获取单个角色
  detail: async (req, res) => {
    try {
      const { id } = req.params;

      const role = await Role.findByPk(id, {
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
          {
            model: Resource,
            as: "resources",
            through: { attributes: [] },
          },
        ],
      });

      if (!role) {
        return res.status(404).json(ResponseUtil.error("角色不存在", 404));
      }

      return res.status(200).json(ResponseUtil.success(role, "获取角色成功"));
    } catch (error) {
      console.error("获取角色失败:", error);
      return res.status(500).json(ResponseUtil.error("获取角色失败", 500));
    }
  },

  // 更新角色
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, description, permissionIds } = req.body;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json(ResponseUtil.error("角色不存在", 404));
      }

      // 检查新角色名是否与其他角色重复
      if ((name && name !== role.name) || (code && code !== role.code)) {
        const existingRole = await Role.findOne({
          where: {
            [Op.and]: [
              { id: { [Op.ne]: id } },
              {
                [Op.or]: [{ name }, { code }],
              },
            ],
          },
        });
        if (existingRole) {
          return res
            .status(400)
            .json(ResponseUtil.error("角色名或编码已存在", 400));
        }
      }

      // 更新角色信息
      await role.update({ name, code, description });

      // 如果提供了权限ID，更新权限关联
      if (permissionIds) {
        await role.setPermissions(permissionIds);
      }

      // 获取更新后的完整角色信息
      const updatedRole = await Role.findByPk(id, {
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
          {
            model: Resource,
            as: "resources",
            through: { attributes: [] },
          },
        ],
      });

      return res
        .status(200)
        .json(ResponseUtil.success(updatedRole, "角色更新成功"));
    } catch (error) {
      console.error("更新角色失败:", error);
      return res.status(500).json(ResponseUtil.error("更新角色失败", 500));
    }
  },

  // 删除角色
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json(ResponseUtil.error("角色不存在", 404));
      }

      // 先清空所有权限和资源关联，避免外键约束冲突
      await role.setPermissions([]);
      await role.setResources([]);
      // 如有用户关联，也建议先检查/清空

      // 检查角色是否有关联的用户
      const userCount = await role.countUsers();
      if (userCount > 0) {
        return res
          .status(400)
          .json(ResponseUtil.error("无法删除，该角色下存在用户", 400));
      }

      await role.destroy();
      return res.status(200).json(ResponseUtil.success(null, "角色删除成功"));
    } catch (error) {
      console.error("删除角色失败:", error);
      return res.status(500).json(ResponseUtil.error("删除角色失败", 500));
    }
  },

  // 分配资源（及按钮权限）
  assignResources: async (req, res) => {
    try {
      const { roleId } = req.params;
      const { resourceIds, permissionIds } = req.body;

      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(ResponseUtil.error("角色不存在", 404));
      }

      // 分配资源
      await role.setResources(resourceIds || []);
      // 分配按钮权限
      await role.setPermissions(permissionIds || []);

      // 获取更新后的角色信息
      const updatedRole = await Role.findByPk(roleId, {
        include: [
          {
            model: Resource,
            as: "resources",
            through: { attributes: [] },
          },
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
        ],
      });

      return res
        .status(200)
        .json(ResponseUtil.success(updatedRole, "资源及按钮权限分配成功"));
    } catch (error) {
      console.error("分配资源失败:", error);
      return res.status(500).json(ResponseUtil.error("分配资源失败", 500));
    }
  },

  // 分配权限
  assignPermissions: async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(ResponseUtil.error("角色不存在", 404));
      }

      // 更新角色的权限关联
      await role.setPermissions(permissionIds);

      // 获取更新后的角色信息
      const updatedRole = await Role.findByPk(roleId, {
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
        ],
      });

      return res
        .status(200)
        .json(ResponseUtil.success(updatedRole, "权限分配成功"));
    } catch (error) {
      console.error("分配权限失败:", error);
      return res.status(500).json(ResponseUtil.error("分配权限失败", 500));
    }
  },

  // 切换角色状态（启用/禁用）
  toggleStatus: async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const roleId = req.params.id;
      const role = await Role.findByPk(roleId);

      if (!role) {
        await transaction.rollback();
        return res.status(404).json(ResponseUtil.error("Role not found", 404));
      }

      // 切换状态
      role.status = role.status === 1 ? 0 : 1;
      await role.save({ transaction });

      await transaction.commit();
      const statusMessage = role.status === 1 ? "enabled" : "disabled";
      res.json(
        ResponseUtil.success(
          { id: role.id, status: role.status },
          `Role ${statusMessage} successfully`
        )
      );
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  },

  // 获取所有角色（不分页）
  listAll: async (req, res) => {
    try {
      const { status } = req.query;

      const where = {};
      if (status !== undefined) {
        where.status = status === "true" || status === "1" ? 1 : 0;
      }

      const roles = await Role.findAll({
        where,
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(ResponseUtil.success(roles));
    } catch (error) {
      console.error("获取所有角色失败:", error);
      return res.status(500).json(ResponseUtil.error("获取所有角色失败", 500));
    }
  },

  // 获取指定角色的资源及其按钮权限（仅返回该角色实际拥有的按钮权限）
  getResources: async (req, res) => {
    try {
      const { id } = req.params;
      // 查询角色及其资源、权限
      const role = await Role.findByPk(id, {
        include: [
          {
            model: Resource,
            as: "resources",
            through: { attributes: [] },
          },
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
        ],
      });
      if (!role) {
        return res.status(404).json(ResponseUtil.error("角色不存在", 404));
      }
      const permissionIds = role.permissions.map((p) => p.id);
      // 查询每个资源下的 actions，只保留该角色拥有的按钮权限
      const resourcesWithActions = await Promise.all(
        role.resources.map(async (resource) => {
          const actions = await ResourceAction.findAll({
            where: { resourceId: resource.id },
            include: [{ model: Permission, as: "permission" }],
            order: [["sort", "ASC"]],
          });
          // 只保留该角色拥有的按钮权限
          const filteredActions = actions.filter(
            (action) =>
              action.permission && permissionIds.includes(action.permission.id)
          );
          return {
            ...resource.toJSON(),
            actions: filteredActions.map((a) => a.toJSON()),
          };
        })
      );
      return res
        .status(200)
        .json(
          ResponseUtil.success(
            resourcesWithActions,
            "获取角色资源及按钮权限成功"
          )
        );
    } catch (error) {
      console.error("获取角色资源及按钮权限失败:", error);
      return res
        .status(500)
        .json(ResponseUtil.error("获取角色资源及按钮权限失败", 500));
    }
  },
};

module.exports = roleController;
