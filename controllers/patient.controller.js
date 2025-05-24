const { Patient } = require("../models");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");
const crypto = require("crypto"); // 导入 Node.js 的 crypto 模块

// 添加 RSA 私钥字符串
const RSA_PRIVATE_KEY_PEM = process.env.RSA_PRIVATE_KEY_PEM;

// 解密函数
async function hybridDecrypt(encryptedData, privateKeyPem) {
  try {
    // 1. 导入RSA私钥
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    });

    // 2. 解密AES密钥
    const encryptedAesKeyBuffer = Buffer.from(
      encryptedData.encryptedAesKey,
      "base64"
    );
    const aesKeyBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedAesKeyBuffer
    );

    // 3. 创建 AES 解密器
    const ivBuffer = Buffer.from(encryptedData.iv, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      aesKeyBuffer,
      ivBuffer
    );

    // 4. 解密数据
    const encryptedDataBuffer = Buffer.from(
      encryptedData.encryptedData,
      "base64"
    );
    let decryptedData = decipher.update(encryptedDataBuffer);
    decryptedData = Buffer.concat([decryptedData, decipher.final()]);

    // 5. 将解密后的数据解析为 JSON 对象
    return JSON.parse(decryptedData.toString("utf8"));
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

// 创建病患
exports.create = async (req, res) => {
  try {
    // !!! 添加解密逻辑 !!!
    const decryptedData = await hybridDecrypt(req.body, RSA_PRIVATE_KEY_PEM); // 解密

    const patient = await Patient.create(decryptedData); // 使用解密后的数据

    res.status(201).json(ResponseUtil.success(patient, "病患创建成功"));
  } catch (error) {
    console.error("Error creating patient:", error);
    // 返回更友好的错误信息，避免泄露解密失败细节
    res
      .status(500)
      .json(ResponseUtil.error("服务器内部错误或数据解密失败", 500));
  }
};

// 获取病患列表
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      search,
      name,
      phone,
      id_card,
      status,
    } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    if (status !== undefined && status !== null && status !== "")
      where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { id_card: { [Op.like]: `%${search}%` } },
        { doctor: { [Op.like]: `%${search}%` } },
      ];
    }
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (phone) where.phone = { [Op.like]: `%${phone}%` };
    if (id_card) where.id_card = { [Op.like]: `%${id_card}%` };
    const { count, rows } = await Patient.findAndCountAll({
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
    console.error("Error getting patients:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 获取单个病患
exports.findOne = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json(ResponseUtil.error("未找到病患", 404));
    }
    res.json(ResponseUtil.success(patient));
  } catch (error) {
    console.error("Error getting patient:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 更新病患
exports.update = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json(ResponseUtil.error("未找到病患", 404));
    }

    // !!! 添加解密逻辑 !!!
    const decryptedData = await hybridDecrypt(
      req.body.data,
      RSA_PRIVATE_KEY_PEM
    );
    await patient.update(decryptedData); // 使用解密后的数据

    res.json(ResponseUtil.success(patient, "病患更新成功"));
  } catch (error) {
    console.error("Error updating patient:", error);
    // 返回更友好的错误信息
    res
      .status(500)
      .json(ResponseUtil.error("服务器内部错误或数据解密失败", 500));
  }
};

// 删除病患
exports.delete = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json(ResponseUtil.error("未找到病患", 404));
    }
    await patient.destroy();
    res.json(ResponseUtil.success(null, "病患删除成功"));
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};

// 批量删除病患
exports.deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("参数ids不能为空数组", 400));
    }
    const count = await Patient.destroy({ where: { id: ids } });
    res.json(ResponseUtil.success({ deleted: count }, "批量删除成功"));
  } catch (error) {
    console.error("Error batch deleting patients:", error);
    res.status(500).json(ResponseUtil.error("服务器内部错误", 500));
  }
};
