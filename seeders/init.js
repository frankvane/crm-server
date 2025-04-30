"use strict";

const {
  User,
  Role,
  Permission,
  Resource,
  ResourceAction,
} = require("../models");

async function createInitialData() {
  try {
    console.log("开始创建初始数据...");

    // 1. 创建基础权限
    console.log("创建权限...");
    const permissions = await Permission.bulkCreate([
      {
        name: "view_roles",
        action: "read",
        resource: "role",
        description: "查看角色列表",
      },
      {
        name: "teachadmin:allstudents:get",
        action: "read",
        resource: "allstudents",
        description: "查看全部学生列表",
      },
      {
        name: "teachadmin:allstudents:query",
        action: "read",
        resource: "allstudents",
        description: "查询学生",
      },
      {
        name: "teachadmin:allstudents:export",
        action: "export",
        resource: "allstudents",
        description: "导出学生数据",
      },
      // 添加更多权限...
    ]);

    // 2. 创建资源菜单
    console.log("创建资源菜单...");
    const teachAdmin = await Resource.create({
      name: "教学管理",
      code: "teachadmin",
      type: "menu",
      path: "teachadmin",
      component: "Layout",
      icon: "通知公告",
      hidden: false,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "教学管理",
        icon: "通知公告",
        noCache: false,
        link: null,
      },
      description: "教学管理模块",
    });

    // 创建子菜单
    await Resource.create({
      name: "全部学生列表",
      code: "teachadmin:allstudents",
      type: "menu",
      path: "allstudents",
      parentId: teachAdmin.id,
      component: "teachadmin/allstudents/index",
      icon: "#",
      hidden: false,
      meta: {
        title: "全部学生列表",
        icon: "#",
        noCache: false,
        link: null,
      },
      description: "全部学生列表",
    });

    // 3. 创建角色
    console.log("创建角色...");
    const adminRole = await Role.create({
      name: "学院讲师",
      code: "30",
      description: "学院讲师角色",
    });

    const userRole = await Role.create({
      name: "通用",
      code: "20",
      description: "通用角色",
    });

    // 4. 创建管理员用户
    console.log("创建管理员用户...");
    const adminUser = await User.create({
      username: "admin",
      password: "admin123", // 密码会被模型的钩子自动加密
      email: "admin@example.com",
      status: true,
    });

    // 5. 建立关联关系
    console.log("建立关联关系...");
    // 为角色分配权限
    await adminRole.setPermissions(permissions);
    await userRole.setPermissions([permissions[0]]); // 只分配查看角色列表权限

    // 为用户分配角色
    await adminUser.setRoles([adminRole, userRole]);

    // 为角色分配资源
    await adminRole.setResources([teachAdmin]);

    console.log("✓ 初始数据创建完成");
  } catch (error) {
    console.error("创建初始数据失败:", error);
    throw error;
  }
}

module.exports = createInitialData;
