const { Patient } = require("../models");
const { Op } = require("sequelize");
const ResponseUtil = require("../utils/response");
const crypto = require("crypto"); // 导入 Node.js 的 crypto 模块

// 添加 RSA 私钥字符串
const RSA_PRIVATE_KEY_PEM = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAxs3MYClwvG9wlHQTthGD/bI9gK436bvq/ikQnPKAxdzPt31N
f0Sn0v4SlHJtzjv5S3ipymR5o+Z5tDD/hO8OdB53jgUibzIeP7+OuO14vd1pqYfS
+ksW4riYMC8xQYhfW+UTL0h5wy8zmKeLBwvGv7VpBAJGVZze9C+DUN2oIz0Pybvt
+nqTzOXwQ/ehSVqR5LfJFNs7piTrf2+bEe9Moz+hyx0AsPKtGllJuGOp+hegHSVI
1IqhFwYXxH5thV90Dl3epovkYTz99bRUyjfaGJKZrwFjNUbkYjNsv+Hai5SuvB+C
0pDgiRJsbklw7S6h+pC4bxaS898YPtcxFUjnfQIDAQABAoIBABvVxL/SDY7Uq5ad
igT7/tcOlb3mpr17KjPb3A+dhJoviIXQbYFcQ4MvP7q5KtatXwJKKrvDxaRFKNUp
5xzdu9BWU7b20RNwmPuj/n+2ACnVTm4GLmwNB29HGUfl06exSGi9cio0o5fIjBjb
nIOoCnPdGo8NInvqMu1Nmb1Ay8HjE27lgpEDecwyXUsfZip3cMpyTrMkG/enckIv
XuV6w4RvZmsz8hIZQCcKwMu15sFyjk/z+7OWWNVIAu5maRbGb+MaIXxZV8UKJ0Z6
mNLQYXmAvJ+qKf7y9E6+C0qJRbuAMAmJbgQ0mrSI6EQ0dbaAPIGwTothNTGeNxIW
Utj36gECgYEA847SCi7TGeqc8hto+zTW3h+1C4cPR3gNKIwtFmeajIsH49sX6zxL
cOYTA2Ol5LQ26TgQHL0K/djzAxi1fl/dGI+iGzeQmNOk/cLJOUxJiTLTPoF9Ou0J
XSiD+WI6gVZuPyPw86q/autDpq+ImCGq/p8DrNFMzEOBZH9GEi5Bs9ECgYEA0PWy
uImk8UzaseWxNRftyajNXacpfuZacTehxFzWZYBd0/X65KGlKeT17jalmOBKETeZ
bCjZrvhqV6wxn/4Eg9mED5WDxegn1qrxYE6UsmEcQX/oUuFvNX14RAh9mrFNZUeR
qx7RREJr/PQv8UNsyep7aCNDZjENVY2lEfolP+0CgYEAx0Uu7E3rQeUGi7+JYR6W
SzV99vSFt7+tZGNr8EzL0fledzqmkzw9rR1QqRE6hag81QudgyXYfGCoUvxAYikk
yBecVhBcKe3frA9We57C+5Gt7BId17xgUOv5Lm0D2RZSFS7e0T3+ZwgdzZ8Ibw/8
y15mr1p/LxB8KTFIr09RSkECgYAIrpy9ZCKxT/MqPxPs09Cyd0wJHx/vQNzzJU5O
oFjcIMhFPUwuYbT+F6BMRIL+5hrNulSqlMvupC2u9N2e+yvu2oPNLfYqq+mz1qhu
yvUMsFI/OnRJtUosm8j6cqvdWI6RrbaUuJQTVPstqGuxh46mmRKFkimDvngCXP9F
zvHrRQKBgQDcOcm5jMCyvF8ESPfuVVGWJPyahQBeb/vRrd9/pRzve8qAUS785mw6
n3u1VEfy0Er23GYGSqqKPRjYuAEaNVHoQXSeZgv8cW7/FNQZ3yH17MOGBln9Gsry
Miq+3khk8n0JVyRifCl1tpJrZ2tNGut2gAscdEQayp5vJWXKS+opng==
-----END RSA PRIVATE KEY-----`;

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
    console.log("Received encrypted data for create:", req.body); // Log encrypted data
    const decryptedData = await hybridDecrypt(req.body, RSA_PRIVATE_KEY_PEM); // 解密

    // console.log("Decrypted data for create:", decryptedData);

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
    console.log("Received encrypted data for update:", req.body); // Log encrypted data
    const decryptedData = await hybridDecrypt(
      req.body.data,
      RSA_PRIVATE_KEY_PEM
    );
    console.log("Decrypted data for update:", decryptedData); // Log decrypted data

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
