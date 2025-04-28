const bcrypt = require("bcryptjs");
const { User, Role, Permission } = require("../models");

async function createInitialData() {
  try {
    // 1. 创建权限
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
        description: "查看用户",
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
        name: "manage_categories",
        action: "manage",
        resource: "category",
        description: "管理分类",
      },
    ]);

    // 2. 创建角色
    const adminRole = await Role.create({
      name: "admin",
      description: "系统管理员",
    });

    const userRole = await Role.create({
      name: "user",
      description: "普通用户",
    });

    // 3. 为角色分配权限
    // 管理员拥有所有权限
    await adminRole.setPermissions(permissions);
    // 普通用户只有查看权限
    await userRole.setPermissions(
      permissions.filter((p) => p.name === "view_users")
    );

    // 4. 创建管理员用户
    const adminUser = await User.create({
      username: "admin",
      password: "admin123", // 会自动加密
      email: "admin@example.com",
      status: true,
    });

    // 5. 为管理员分配角色
    await adminUser.setRoles([adminRole.id]);

    console.log("Initial data created successfully!");
    return { adminUser, adminRole, userRole, permissions };
  } catch (error) {
    console.error("Error creating initial data:", error);
    throw error;
  }
}

module.exports = createInitialData;
