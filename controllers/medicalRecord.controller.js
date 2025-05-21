const { MedicalRecord } = require("../models");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");
// const crypto = require("crypto");
// const privateKey = process.env.PRIVATE_KEY;
// 创建病例
exports.create = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(ResponseUtil.success(record, "病例创建成功"));
  } catch (error) {
    console.error("Error creating medical record:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取病例列表
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      search,
      patient_id,
      doctor,
      status,
    } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (status !== undefined && status !== null && status !== "")
      where.status = status;
    if (patient_id) where.patient_id = patient_id;
    if (doctor) where.doctor = { [Op.like]: `%${doctor}%` };
    if (search) {
      where[Op.or] = [
        { diagnosis: { [Op.like]: `%${search}%` } },
        { treatment: { [Op.like]: `%${search}%` } },
        { doctor: { [Op.like]: `%${search}%` } },
        { remark: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await MedicalRecord.findAndCountAll({
      where,
      offset: Number(offset),
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
    });
    const response = {
      list: rows,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
      },
    };
    res.json(ResponseUtil.success(response));
  } catch (error) {
    console.error("Error getting medical records:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取单个病例
exports.findOne = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json(ResponseUtil.error("未找到病例", 404));
    }
    res.json(ResponseUtil.success(record));
  } catch (error) {
    console.error("Error getting medical record:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 更新病例
exports.update = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json(ResponseUtil.error("未找到病例", 404));
    }
    await record.update(req.body);
    res.json(ResponseUtil.success(record, "病例更新成功"));
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 删除病例
exports.delete = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json(ResponseUtil.error("未找到病例", 404));
    }
    await record.destroy();
    res.json(ResponseUtil.success(null, "病例删除成功"));
  } catch (error) {
    console.error("Error deleting medical record:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 批量删除病例
exports.deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("参数ids不能为空数组", 400));
    }
    const count = await MedicalRecord.destroy({ where: { id: ids } });
    res.json(ResponseUtil.success({ deleted: count }, "批量删除成功"));
  } catch (error) {
    console.error("Error batch deleting medical records:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};
