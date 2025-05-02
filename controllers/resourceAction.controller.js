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
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }

      // 兼容 code 字段为单词或完整拼接格式
      let rawCode = actionData.code;
      let actionCode = rawCode.includes(":")
        ? rawCode.split(":").pop()
        : rawCode;
      const fullCode = `${resource.code}:${actionCode}`;

      // 检查同一资源下是否已存在相同代码的操作
      const existingAction = await ResourceAction.findOne({
        where: {
          resourceId,
          code: fullCode,
        },
      });

      if (existingAction) {
        return res
          .status(400)
          .json(ResponseUtil.error("该资源下已存在相同代码的操作", 400));
      }

      // 创建操作（code 字段为拼接值）
      const action = await ResourceAction.create({
        ...actionData,
        code: fullCode,
        resourceId,
      });

      // 自动创建对应的权限
      const permission = await Permission.create({
        name: fullCode,
        code: fullCode,
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

      res.status(201).json(ResponseUtil.success(result, "资源操作创建成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },

  // 获取资源操作列表
  async list(req, res) {
    try {
      const { resourceId } = req.params;
      const { page = 1, pageSize = 10 } = req.query;

      // 检查资源是否存在
      const resource = await Resource.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }

      const { count, rows: actions } = await ResourceAction.findAndCountAll({
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
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize),
      });

      res.json(
        ResponseUtil.page(actions, count, parseInt(page), parseInt(pageSize))
      );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
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
        return res.status(404).json(ResponseUtil.error("资源操作不存在", 404));
      }

      res.json(ResponseUtil.success(action, "资源操作获取成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
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
          {
            model: Resource,
            as: "resource",
            attributes: ["id", "name", "code"],
          },
        ],
      });

      if (!action) {
        return res.status(404).json(ResponseUtil.error("资源操作不存在", 404));
      }

      // 获取 resource.code
      const resource = action.resource || (await Resource.findByPk(resourceId));
      if (!resource) {
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }

      // 兼容 code 字段为单词或完整拼接格式
      let rawCode = updateData.code || action.code.split(":").pop();
      let actionCode = rawCode.includes(":")
        ? rawCode.split(":").pop()
        : rawCode;
      let fullCode = `${resource.code}:${actionCode}`;

      // 如果更改了代码，需要检查是否重复
      if (fullCode !== action.code) {
        const existingAction = await ResourceAction.findOne({
          where: {
            resourceId,
            code: fullCode,
            id: { [Op.ne]: id },
          },
        });

        if (existingAction) {
          return res
            .status(400)
            .json(ResponseUtil.error("该资源下已存在相同代码的操作", 400));
        }

        // 更新对应的权限代码
        if (action.permission) {
          await action.permission.update({
            name: fullCode,
            code: fullCode,
            description: updateData.description || action.description,
          });
        }
      }

      // 更新 ResourceAction 的 code 字段
      await action.update({ ...updateData, code: fullCode });

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

      res.json(ResponseUtil.success(result, "资源操作更新成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
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
        return res.status(404).json(ResponseUtil.error("资源操作不存在", 404));
      }

      // 删除关联的权限
      if (action.permission) {
        await action.permission.destroy();
      }

      await action.destroy();

      res.json(ResponseUtil.success(null, "资源操作删除成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
};

module.exports = resourceActionController;
