const jwt = require("../utils/jwt");

/**
 * 生成测试用的请求头
 * @param {number} userId - 用户ID
 * @returns {Object} - 包含Authorization的请求头
 */
function getTestHeaders(userId = 1) {
  const token = jwt.generateAccessToken(userId);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * 生成测试用的用户数据
 * @param {Object} overrides - 需要覆盖的字段
 * @returns {Object} - 用户数据
 */
function generateUserData(overrides = {}) {
  return {
    username: "testuser",
    password: "password123",
    email: "test@example.com",
    status: 1,
    ...overrides,
  };
}

/**
 * 生成测试用的角色数据
 * @param {Object} overrides - 需要覆盖的字段
 * @returns {Object} - 角色数据
 */
function generateRoleData(overrides = {}) {
  return {
    name: "测试角色",
    code: "test_role",
    description: "用于测试的角色",
    ...overrides,
  };
}

/**
 * 生成测试用的资源数据
 * @param {Object} overrides - 需要覆盖的字段
 * @returns {Object} - 资源数据
 */
function generateResourceData(overrides = {}) {
  return {
    name: "测试资源",
    code: "test_resource",
    type: "menu",
    path: "/test",
    component: "Test",
    description: "用于测试的资源",
    ...overrides,
  };
}

module.exports = {
  getTestHeaders,
  generateUserData,
  generateRoleData,
  generateResourceData,
};
