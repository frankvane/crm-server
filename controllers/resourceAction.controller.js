const { ResourceAction, Resource, Permission } = require("../models");
const ResponseUtil = require("../utils/response");
const { Op } = require("sequelize");

const resourceActionController = {
  // 创建资源操作
  async create(req, res) {
    try {
      const { resourceId } = req.params;
      const actionData = req.body;

      // 检查资源是否存在
      const resource = await Resource.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // 检查同一资源下是否已存在相同代码的操作
      const existingAction = await ResourceAction.findOne({
        where: {
          resourceId,
          code: actionData.code,
        },
      });

      if (existingAction) {
        return res.status(400).json({
          success: false,
          message: "Action code already exists for this resource",
        });
      }

      // 创建操作
      const action = await ResourceAction.create({
        ...actionData,
        resourceId,
      });

      // 自动创建对应的权限
      const permission = await Permission.create({
        name: `${resource.code}:${action.code}`,
        code: `${resource.code}:${action.code}`,
        description: action.description,
        actionId: action.id,
        resourceId,
      });

      const result = await ResourceAction.findByPk(action.id, {
        include: [
          {
            model: Resource,
            as: "resource",
            attributes: ["id", "name", "code"],
          },
          {
            model: Permission,
            as: "permission",
            attributes: ["id", "name", "code"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 获取资源操作列表
  async list(req, res) {
    try {
      const { resourceId } = req.params;

      // 检查资源是否存在
      const resource = await Resource.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      const actions = await ResourceAction.findAll({
        where: { resourceId },
        include: [
          {
            model: Resource,
            as: "resource",
            attributes: ["id", "name", "code"],
          },
          {
            model: Permission,
            as: "permission",
            attributes: ["id", "name", "code"],
          },
        ],
        order: [["sort", "ASC"]],
      });

      res.json({
        success: true,
        data: actions,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 获取单个资源操作
  async getById(req, res) {
    try {
      const { resourceId, id } = req.params;

      const action = await ResourceAction.findOne({
        where: {
          id,
          resourceId,
        },
        include: [
          {
            model: Resource,
            as: "resource",
            attributes: ["id", "name", "code"],
          },
          {
            model: Permission,
            as: "permission",
            attributes: ["id", "name", "code"],
          },
        ],
      });

      if (!action) {
        return res.status(404).json({
          success: false,
          message: "Resource action not found",
        });
      }

      res.json({
        success: true,
        data: action,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 更新资源操作
  async update(req, res) {
    try {
      const { resourceId, id } = req.params;
      const updateData = req.body;

      const action = await ResourceAction.findOne({
        where: {
          id,
          resourceId,
        },
        include: [
          {
            model: Permission,
            as: "permission",
          },
        ],
      });

      if (!action) {
        return res.status(404).json({
          success: false,
          message: "Resource action not found",
        });
      }

      // 如果更改了代码，需要检查是否重复
      if (updateData.code && updateData.code !== action.code) {
        const existingAction = await ResourceAction.findOne({
          where: {
            resourceId,
            code: updateData.code,
            id: { [Op.ne]: id },
          },
        });

        if (existingAction) {
          return res.status(400).json({
            success: false,
            message: "Action code already exists for this resource",
          });
        }

        // 更新对应的权限代码
        if (action.permission) {
          const resource = await Resource.findByPk(resourceId);
          await action.permission.update({
            name: `${resource.code}:${updateData.code}`,
            code: `${resource.code}:${updateData.code}`,
            description: updateData.description || action.description,
          });
        }
      }

      await action.update(updateData);

      const result = await ResourceAction.findByPk(id, {
        include: [
          {
            model: Resource,
            as: "resource",
            attributes: ["id", "name", "code"],
          },
          {
            model: Permission,
            as: "permission",
            attributes: ["id", "name", "code"],
          },
        ],
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 删除资源操作
  async delete(req, res) {
    try {
      const { resourceId, id } = req.params;

      const action = await ResourceAction.findOne({
        where: {
          id,
          resourceId,
        },
        include: [
          {
            model: Permission,
            as: "permission",
          },
        ],
      });

      if (!action) {
        return res.status(404).json({
          success: false,
          message: "Resource action not found",
        });
      }

      // 删除关联的权限
      if (action.permission) {
        await action.permission.destroy();
      }

      await action.destroy();

      res.json({
        success: true,
        message: "Resource action deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = resourceActionController;
