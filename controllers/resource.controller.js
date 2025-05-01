const { Resource } = require("../models");
const ResponseUtil = require("../utils/response");

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
  // 获取资源列表
  async list(req, res) {
    try {
      const resources = await Resource.findAll();

      // 尝试将meta字段解析回对象
      const processedResources = resources.map((resource) => {
        const resourceObj = resource.toJSON();
        if (resourceObj.meta && typeof resourceObj.meta === "string") {
          try {
            resourceObj.meta = JSON.parse(resourceObj.meta);
          } catch (e) {
            // 如果解析失败，保留原始字符串
            console.error("Failed to parse meta JSON:", e);
          }
        }
        return resourceObj;
      });

      res.json(ResponseUtil.success(processedResources, "资源列表获取成功"));
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
    try {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).json(ResponseUtil.error("资源不存在", 404));
      }
      await resource.destroy();
      res.json(ResponseUtil.success(null, "资源删除成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
};

module.exports = resourceController;
