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
        // 资源与资源操作管理权限
        {
          name: "manage_resources",
          action: "manage",
          resource: "resource",
          description: "管理资源（菜单/页面）",
        },
        {
          name: "view_resources",
          action: "read",
          resource: "resource",
          description: "查看资源（菜单/页面）",
        },
        {
          name: "manage_resource_actions",
          action: "manage",
          resource: "resource_action",
          description: "管理资源操作（按钮/行为）",
        },
        {
          name: "view_resource_actions",
          action: "read",
          resource: "resource_action",
          description: "查看资源操作（按钮/行为）",
        },
        // 分类管理权限
        {
          name: "manage_categories",
          action: "manage",
          resource: "category",
          description: "管理分类（含类型/树/节点）",
        },
        {
          name: "view_categories",
          action: "read",
          resource: "category",
          description: "查看分类（含类型/树/节点）",
        },
        {
          name: "create_category",
          action: "create",
          resource: "category",
          description: "创建分类",
        },
        {
          name: "update_category",
          action: "update",
          resource: "category",
          description: "更新分类",
        },
        {
          name: "delete_category",
          action: "delete",
          resource: "category",
          description: "删除分类",
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

      // 2.3 创建审批管理子菜单
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

      // 2.4 创建财务管理子菜单
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

      const managerRole = await Role.create({
        name: "管理员",
        code: "manager",
        description: "普通管理员",
      });

      // 4. 分配权限给角色
      console.log("分配权限给角色...");
      // 超级管理员拥有所有权限
      await adminRole.setPermissions(permissions);
      // 管理员拥有部分权限（仅分类相关和查看用户/角色/资源）
      const managerPermissions = permissions.filter(
        (p) =>
          p.name.startsWith("view_") ||
          p.name.startsWith("manage_categories") ||
          p.name.startsWith("view_categories") ||
          p.name.startsWith("create_category") ||
          p.name.startsWith("update_category") ||
          p.name.startsWith("delete_category")
      );
      await managerRole.setPermissions(managerPermissions);

      // 5. 创建管理员用户
      console.log("创建管理员用户...");
      const adminUser = await User.create({
        username: "admin",
        password: "admin123",
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
