const { ResourceAction } = require("../models");
const ResponseUtil = require("../utils/response");

const resourceActionController = {
  // 创建资源操作
  async create(req, res) {
    try {
      const action = await ResourceAction.create(req.body);
      res.json(ResponseUtil.success(action, "资源操作创建成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取资源操作列表
  async list(req, res) {
    try {
      const actions = await ResourceAction.findAll();
      res.json(ResponseUtil.success(actions, "资源操作列表获取成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 获取单个资源操作
  async getById(req, res) {
    try {
      const action = await ResourceAction.findByPk(req.params.id);
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
      const action = await ResourceAction.findByPk(req.params.id);
      if (!action) {
        return res.status(404).json(ResponseUtil.error("资源操作不存在", 404));
      }
      await action.update(req.body);
      res.json(ResponseUtil.success(action, "资源操作更新成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
  // 删除资源操作
  async delete(req, res) {
    try {
      const action = await ResourceAction.findByPk(req.params.id);
      if (!action) {
        return res.status(404).json(ResponseUtil.error("资源操作不存在", 404));
      }
      await action.destroy();
      res.json(ResponseUtil.success(null, "资源操作删除成功"));
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  },
};

module.exports = resourceActionController;
