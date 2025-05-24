const {
  Resource,
  ResourceAction,
  Permission,
  sequelize,
} = require("../models");
const ResponseUtil = require("../utils/response");
const { Op } = require("sequelize");

// 将meta字段处理逻辑抽出来作为工具函数
const processMeta = (resource) => {
  const resourceObj = resource.toJSON();
  if (resourceObj.meta && typeof resourceObj.meta === "string") {
    try {
      resourceObj.meta = JSON.parse(resourceObj.meta);
    } catch (e) {
      console.error("Failed to parse meta JSON:", e);
    }
  }
  return resourceObj;
};

// 构建资源树的递归函数
const buildResourceTree = (resources, parentId = null) => {
  return resources
    .filter((resource) => resource.parentId === parentId)
    .map((resource) => ({
      ...resource,
      children: buildResourceTree(resources, resource.id),
    }))
    .sort((a, b) => a.sort - b.sort); // 按sort字段排序
};

const resourceController = {
  // 创建资源
  async create(req, res) {
    try {
      const resourceData = { ...req.body };

      // 检查是否有meta字段且为对象，如果是则序列化为JSON字符串
      if (resourceData.meta && typeof resourceData.meta === "object") {
        resourceData.meta = JSON.stringify(resourceData.meta);
      }

      const resource = await Resource.create(resourceData);
      res.json(ResponseUtil.success(resource, "资源创建成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取资源列表（扁平结构）
  async list(req, res) {
    try {
      const resources = await Resource.findAll({
        order: [
          ["sort", "ASC"],
          ["createdAt", "ASC"],
        ],
      });

      const processedResources = resources.map(processMeta);
      res.json(ResponseUtil.success(processedResources, "资源列表获取成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取资源树
  async tree(req, res) {
    try {
      const resources = await Resource.findAll({
        order: [
          ["sort", "ASC"],
          ["createdAt", "ASC"],
        ],
      });

      // 处理所有资源的meta字段
      const processedResources = resources.map(processMeta);

      // 构建树形结构
      const tree = buildResourceTree(processedResources);

      res.json(ResponseUtil.success(tree, "资源树获取成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取单个资源
  async getById(req, res) {
    try {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }

      // 尝试将meta字段解析回对象
      const resourceObj = resource.toJSON();
      if (resourceObj.meta && typeof resourceObj.meta === "string") {
        try {
          resourceObj.meta = JSON.parse(resourceObj.meta);
        } catch (e) {
          // 如果解析失败，保留原始字符串
          console.error("Failed to parse meta JSON:", e);
        }
      }

      res.json(ResponseUtil.success(resourceObj, "资源获取成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 更新资源
  async update(req, res) {
    try {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }

      const resourceData = { ...req.body };

      // 检查是否有meta字段且为对象，如果是则序列化为JSON字符串
      if (resourceData.meta && typeof resourceData.meta === "object") {
        resourceData.meta = JSON.stringify(resourceData.meta);
      }

      await resource.update(resourceData);

      // 获取更新后的资源并处理meta字段
      const updatedResource = await Resource.findByPk(req.params.id);
      const resourceObj = updatedResource.toJSON();
      if (resourceObj.meta && typeof resourceObj.meta === "string") {
        try {
          resourceObj.meta = JSON.parse(resourceObj.meta);
        } catch (e) {
          // 如果解析失败，保留原始字符串
          console.error("Failed to parse meta JSON:", e);
        }
      }

      res.json(ResponseUtil.success(resourceObj, "资源更新成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 删除资源
  async delete(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      // 查找资源及其关联的资源操作和权限
      const resource = await Resource.findByPk(id, {
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
        transaction: t,
      });

      if (!resource) {
        await t.rollback();
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }

      // 检查是否有子资源
      const hasChildren = await Resource.count({
        where: { parentId: id },
        transaction: t,
      });

      if (hasChildren > 0) {
        await t.rollback();
        return res.status(400).json(ResponseUtil.error("请先删除子资源", 400));
      }

      // 删除关联的权限和资源操作
      if (resource.actions && resource.actions.length > 0) {
        for (const action of resource.actions) {
          if (action.permission) {
            await action.permission.destroy({ transaction: t });
          }
          await action.destroy({ transaction: t });
        }
      }

      // 删除资源本身
      await resource.destroy({ transaction: t });

      await t.commit();
      res.json(ResponseUtil.success(null, "资源删除成功"));
    } catch (error) {
      await t.rollback();
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取资源树及其下所有按钮权限
  async treeWithActions(req, res) {
    try {
      // 查询所有资源及其 actions
      const resources = await Resource.findAll({
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
        order: [
          ["sort", "ASC"],
          ["createdAt", "ASC"],
        ],
      });

      // 处理 meta 字段
      const processedResources = resources.map(processMeta);

      // 构建树形结构，actions 直接挂在每个节点下
      const buildTreeWithActions = (resources, parentId = null) => {
        return resources
          .filter((resource) => resource.parentId === parentId)
          .map((resource) => ({
            ...resource,
            children: buildTreeWithActions(resources, resource.id),
            actions: resource.actions || [],
          }))
          .sort((a, b) => a.sort - b.sort);
      };

      const tree = buildTreeWithActions(processedResources);
      res.json(ResponseUtil.success(tree, "资源树及按钮权限获取成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
};

module.exports = resourceController;
