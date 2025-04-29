"use strict";

const bcrypt = require("bcryptjs");
const { User, Role, Permission } = require("../models");

async function createInitialData() {
  try {
    // 创建权限
    const permissions = await Permission.bulkCreate([
      {
        name: "create_user",
        action: "create",
        resource: "user",
        description: "创建用户",
      },
      {
        name: "view_users",
        action: "read",
        resource: "user",
        description: "查看用户列表",
      },
      {
        name: "update_user",
        action: "update",
        resource: "user",
        description: "更新用户",
      },
      {
        name: "delete_user",
        action: "delete",
        resource: "user",
        description: "删除用户",
      },
      {
        name: "manage_roles",
        action: "manage",
        resource: "role",
        description: "管理角色",
      },
      {
        name: "view_roles",
        action: "read",
        resource: "role",
        description: "查看角色列表",
      },
    ]);

    // 创建角色
    const adminRole = await Role.create({
      name: "admin",
      description: "系统管理员",
    });

    const userRole = await Role.create({
      name: "user",
      description: "普通用户",
    });

    // 为管理员角色分配所有权限
    await adminRole.setPermissions(permissions);

    // 为普通用户角色分配查看权限
    const viewPermissions = permissions.filter((p) => p.action === "read");
    await userRole.setPermissions(viewPermissions);

    // 创建管理员用户
    const adminUser = await User.create({
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      email: "admin@example.com",
    });

    // 为管理员用户分配管理员角色
    await adminUser.setRoles([adminRole]);

    console.log("Initial data created successfully");
  } catch (error) {
    console.error("Error creating initial data:", error);
    throw error;
  }
}

module.exports = createInitialData;
