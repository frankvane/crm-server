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
      // 教学管理权限
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
      {
        name: "teachadmin:mystudents:get",
        action: "read",
        resource: "mystudents",
        description: "查看我的班级学生",
      },
      {
        name: "teachadmin:mystudents:query",
        action: "read",
        resource: "mystudents",
        description: "查询我的班级学生",
      },
      {
        name: "teachadmin:mystudents:export",
        action: "export",
        resource: "mystudents",
        description: "导出我的班级学生",
      },
      // 审批管理权限
      {
        name: "approval:myapply:get",
        action: "read",
        resource: "myapply",
        description: "查看我的申请",
      },
      {
        name: "approval:myapply:query",
        action: "read",
        resource: "myapply",
        description: "查询我的申请",
      },
      {
        name: "approval:myapply:add",
        action: "create",
        resource: "myapply",
        description: "新增申请",
      },
      // 财务管理权限
      {
        name: "finance:ticket:mylist:query",
        action: "read",
        resource: "ticket",
        description: "查询我的罚款单",
      },
    ]);

    // 2. 创建资源菜单
    console.log("创建资源菜单...");

    // 2.1 创建顶级菜单
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

    const approval = await Resource.create({
      name: "审批管理",
      code: "approval",
      type: "menu",
      path: "approval",
      component: "Layout",
      icon: "审批",
      hidden: false,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "审批管理",
        icon: "审批",
        noCache: false,
        link: null,
      },
      description: "审批管理模块",
    });

    const finance = await Resource.create({
      name: "财务管理",
      code: "finance",
      type: "menu",
      path: "finance",
      component: "Layout",
      icon: "社区财务",
      hidden: false,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "财务管理",
        icon: "社区财务",
        noCache: false,
        link: null,
      },
      description: "财务管理模块",
    });

    // 2.2 创建教学管理子菜单
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

    await Resource.create({
      name: "我的班级学生列表",
      code: "teachadmin:mystudents",
      type: "menu",
      path: "mystudents",
      parentId: teachAdmin.id,
      component: "teachadmin/mystudents/index",
      icon: "#",
      hidden: false,
      meta: {
        title: "我的班级学生列表",
        icon: "#",
        noCache: false,
        link: null,
      },
      description: "我的班级学生列表",
    });

    // 2.3 创建审批管理子菜单
    await Resource.create({
      name: "我的申请列表",
      code: "approval:myapply",
      type: "menu",
      path: "myapply",
      parentId: approval.id,
      component: "approval/myapply/index",
      icon: "",
      hidden: false,
      meta: {
        title: "我的申请列表",
        icon: "",
        noCache: false,
        link: null,
      },
      description: "我的申请列表",
    });

    // 2.4 创建财务管理子菜单
    const ticket = await Resource.create({
      name: "罚款单",
      code: "finance:ticket",
      type: "menu",
      path: "ticket",
      parentId: finance.id,
      component: "ParentView",
      icon: "#",
      hidden: false,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "罚款单",
        icon: "#",
        noCache: false,
        link: null,
      },
      description: "罚款单管理",
    });

    await Resource.create({
      name: "我的罚款单",
      code: "finance:ticket:mylist",
      type: "menu",
      path: "mylist",
      parentId: ticket.id,
      component: "finance/ticket/mylist/index",
      icon: "#",
      hidden: false,
      meta: {
        title: "我的罚款单",
        icon: "#",
        noCache: false,
        link: null,
      },
      description: "我的罚款单列表",
    });

    // 3. 创建角色
    console.log("创建角色...");
    const teacherRole = await Role.create({
      name: "学院讲师",
      code: "30",
      description: "学院讲师角色",
    });

    const commonRole = await Role.create({
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
      departmentName: "人工智能教学",
      firstDepartmentName: "人工智能教学",
      staffName: "方晓恩",
      phone: "13819971001",
    });

    // 5. 建立关联关系
    console.log("建立关联关系...");
    // 为角色分配权限
    await teacherRole.setPermissions(permissions);
    await commonRole.setPermissions([permissions[0]]); // 只分配基础权限

    // 为用户分配角色
    await adminUser.setRoles([teacherRole, commonRole]);

    // 为角色分配资源
    await teacherRole.setResources([teachAdmin, approval, finance]);

    console.log("✓ 初始数据创建完成");
  } catch (error) {
    console.error("创建初始数据失败:", error);
    throw error;
  }
}

module.exports = createInitialData;
