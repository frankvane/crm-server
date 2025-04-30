const { sequelize, User, Role, Resource, Permission } = require("../models");
const createInitialData = require("../seeders/init");

// 设置测试环境变量
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";

// 设置测试超时时间
jest.setTimeout(10000);

// 在所有测试开始前执行
beforeAll(async () => {
  try {
    // 按顺序同步数据库表
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // 先创建基础表
    await User.sync({ force: true });
    await Role.sync({ force: true });
    await Resource.sync({ force: true });
    await Permission.sync({ force: true });

    // 再创建关联表
    await sequelize.models.UserRoles.sync({ force: true });
    await sequelize.models.RoleResources.sync({ force: true });
    await sequelize.models.RolePermissions.sync({ force: true });

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("测试数据库表创建完成");

    // 初始化测试数据
    await createInitialData();
    console.log("测试数据初始化完成");
  } catch (error) {
    console.error("测试环境设置失败:", error);
    throw error;
  }
});

// 在所有测试结束后执行
afterAll(async () => {
  try {
    // 关闭数据库连接
    await sequelize.close();
    console.log("测试数据库连接已关闭");
  } catch (error) {
    console.error("关闭数据库连接失败:", error);
    throw error;
  }
});

// 创建测试用户Token的辅助函数
const jwt = require("../utils/jwt");
function getTestUserToken(userId = 1) {
  return jwt.generateAccessToken(userId);
}

module.exports = {
  getTestUserToken,
};
