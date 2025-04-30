const { sequelize, User, Role, Permission } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");

async function clearDatabase() {
  try {
    // 禁用所有表的外键约束
    await sequelize.query(
      "EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'"
    );

    // 先删除关联表
    await sequelize.models.UserRoles.destroy({ truncate: true, force: true });
    await sequelize.models.RoleResources.destroy({
      truncate: true,
      force: true,
    });
    await sequelize.models.RolePermissions.destroy({
      truncate: true,
      force: true,
    });

    // 再删除基础表
    await User.destroy({ truncate: true, force: true });
    await Role.destroy({ truncate: true, force: true });
    await sequelize.models.Resource.destroy({ truncate: true, force: true });
    await Permission.destroy({ truncate: true, force: true });

    // 重新启用所有表的外键约束
    await sequelize.query(
      "EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL'"
    );
  } catch (error) {
    console.error("清理数据库失败:", error);
    throw error;
  }
}

async function createTestUser(userData = {}) {
  const defaultData = {
    username: "testuser",
    password: await bcrypt.hash("password123", 10),
    email: "test@example.com",
    status: 1,
  };

  const user = await User.create({ ...defaultData, ...userData });
  return user;
}

async function createTestRole(roleData = {}) {
  const defaultData = {
    name: "testrole",
    description: "Test role description",
  };

  const role = await Role.create({ ...defaultData, ...roleData });
  return role;
}

async function createTestPermission(permData = {}) {
  const defaultData = {
    name: "testpermission",
    action: "read",
    resource: "test",
    description: "Test permission description",
  };

  const permission = await Permission.create({ ...defaultData, ...permData });
  return permission;
}

async function getAuthToken(user) {
  return jwt.generateAccessToken(user.id);
}

module.exports = {
  clearDatabase,
  createTestUser,
  createTestRole,
  createTestPermission,
  getAuthToken,
};
