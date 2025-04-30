const jwt = require("../utils/jwt");

// 设置测试环境变量
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";

// 设置测试超时时间
jest.setTimeout(30000);

// 在所有测试开始前执行
beforeAll(async () => {
  // 这里可以添加一些全局的测试设置
  console.log("开始运行测试...");
});

// 在所有测试结束后执行
afterAll(async () => {
  // 这里可以添加一些清理工作
  console.log("测试运行结束");
});

// 创建测试用户Token的辅助函数
function getTestUserToken(userId = 1) {
  return jwt.generateAccessToken(userId);
}

module.exports = {
  getTestUserToken,
};
