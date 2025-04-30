"use strict";

const {
  User,
  Role,
  Permission,
  Resource,
  ResourceAction,
} = require("../models");
const { clearDatabase } = require("../utils/database");
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("开始清理数据库...");
      await clearDatabase();

      console.log("开始创建初始数据...");

      // 1. 创建基础权限
      console.log("创建权限...");
      const permissions = await Permission.bulkCreate([
        // 用户管理权限
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
        // 角色管理权限
        {
          name: "view_roles",
          action: "read",
          resource: "role",
          description: "查看角色列表",
        },
        {
          name: "manage_roles",
          action: "manage",
          resource: "role",
          description: "管理角色",
        },
      ]);

      // 2. 创建资源菜单
      console.log("创建资源菜单...");

      // 2.1 创建顶级菜单
      const system = await Resource.create({
        name: "系统管理",
        code: "system",
        type: "menu",
        path: "system",
        component: "Layout",
        icon: "系统",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: {
          title: "系统管理",
          icon: "系统",
          noCache: false,
          link: null,
        },
        description: "系统管理模块",
      });

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

      // 2.2 创建系统管理子菜单
      await Resource.create({
        name: "用户管理",
        code: "system:user",
        type: "menu",
        path: "user",
        parentId: system.id,
        component: "system/user/index",
        icon: "#",
        hidden: false,
        meta: {
          title: "用户管理",
          icon: "#",
          noCache: false,
          link: null,
        },
        description: "用户管理菜单",
      });

      // 2.3 创建教学管理子菜单
      await Resource.create({
        name: "全部学生",
        code: "teachadmin:allstudents",
        type: "menu",
        path: "allstudents",
        parentId: teachAdmin.id,
        component: "teachadmin/allstudents/index",
        icon: "#",
        hidden: false,
        meta: {
          title: "全部学生",
          icon: "#",
          noCache: false,
          link: null,
        },
        description: "全部学生菜单",
      });

      await Resource.create({
        name: "我的班级",
        code: "teachadmin:mystudents",
        type: "menu",
        path: "mystudents",
        parentId: teachAdmin.id,
        component: "teachadmin/mystudents/index",
        icon: "#",
        hidden: false,
        meta: {
          title: "我的班级",
          icon: "#",
          noCache: false,
          link: null,
        },
        description: "我的班级菜单",
      });

      // 2.4 创建审批管理子菜单
      await Resource.create({
        name: "我的申请",
        code: "approval:myapply",
        type: "menu",
        path: "myapply",
        parentId: approval.id,
        component: "approval/myapply/index",
        icon: "#",
        hidden: false,
        meta: {
          title: "我的申请",
          icon: "#",
          noCache: false,
          link: null,
        },
        description: "我的申请菜单",
      });

      // 2.5 创建财务管理子菜单
      await Resource.create({
        name: "我的罚款单",
        code: "finance:ticket:mylist",
        type: "menu",
        path: "ticket/mylist",
        parentId: finance.id,
        component: "finance/ticket/mylist/index",
        icon: "#",
        hidden: false,
        meta: {
          title: "我的罚款单",
          icon: "#",
          noCache: false,
          link: null,
        },
        description: "我的罚款单菜单",
      });

      // 3. 创建角色
      console.log("创建角色...");
      const adminRole = await Role.create({
        name: "超级管理员",
        code: "admin",
        description: "系统超级管理员",
      });

      const teacherRole = await Role.create({
        name: "教师",
        code: "teacher",
        description: "教师角色",
      });

      const studentRole = await Role.create({
        name: "学生",
        code: "student",
        description: "学生角色",
      });

      // 4. 分配权限给角色
      console.log("分配权限给角色...");
      // 超级管理员拥有所有权限
      await adminRole.addPermissions(permissions);

      // 教师拥有查看学生列表和导出的权限
      const teacherPermissions = permissions.filter(
        (p) =>
          p.name.startsWith("teachadmin:allstudents:") ||
          p.name.startsWith("teachadmin:mystudents:")
      );
      await teacherRole.addPermissions(teacherPermissions);

      // 学生只有查看自己申请的权限
      const studentPermissions = permissions.filter(
        (p) =>
          p.name.startsWith("approval:myapply:") ||
          p.name === "finance:ticket:mylist:query"
      );
      await studentRole.addPermissions(studentPermissions);

      // 5. 创建管理员用户
      console.log("创建管理员用户...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = await User.create({
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        status: 1,
      });

      // 6. 分配角色给管理员用户
      console.log("分配角色给管理员用户...");
      await adminUser.addRole(adminRole);

      console.log("初始数据创建完成！");
    } catch (error) {
      console.error("初始数据创建失败：", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // 清空所有表
    await clearDatabase();
  },
};
