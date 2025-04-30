const { Resource } = require("../models");
const ResponseUtil = require("../utils/response");

const resourceController = {
  // 创建资源
  async create(req, res) {
    try {
      const resource = await Resource.create(req.body);
      res.json(ResponseUtil.success(resource, "资源创建成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取资源列表
  async list(req, res) {
    try {
      const resources = await Resource.findAll();
      res.json(ResponseUtil.success(resources, "资源列表获取成功"));
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
      res.json(ResponseUtil.success(resource, "资源获取成功"));
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
      await resource.update(req.body);
      res.json(ResponseUtil.success(resource, "资源更新成功"));
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
