"use strict";

const { User, Role, Permission, Resource } = require("../models");
const { clearDatabase } = require("../utils/database");
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("开始清理数据库...");
      await clearDatabase();
      console.log("开始创建核心初始数据...");

      // 1. 权限
      const permissions = await Permission.bulkCreate([
        // 用户管理
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
        // 角色管理
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
          description: "查看角色",
        },
        // 资源管理
        {
          name: "manage_resources",
          action: "manage",
          resource: "resource",
          description: "管理资源",
        },
        {
          name: "view_resources",
          action: "read",
          resource: "resource",
          description: "查看资源",
        },
        // 分类类型管理
        {
          name: "manage_categories",
          action: "manage",
          resource: "categoryType",
          description: "管理分类类型",
        },
        {
          name: "view_categories",
          action: "read",
          resource: "categoryType",
          description: "查看分类类型",
        },
        // 分类管理
        {
          name: "manage_category",
          action: "manage",
          resource: "category",
          description: "管理分类",
        },
        {
          name: "view_category",
          action: "read",
          resource: "category",
          description: "查看分类",
        },
      ]);

      // 2. 资源菜单
      const system = await Resource.create({
        name: "系统管理",
        code: "system",
        type: "menu",
        path: "/system",
        component: "Layout",
        icon: "系统",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: { title: "系统管理", icon: "系统", noCache: false, link: null },
        description: "系统管理模块",
      });
      await Resource.create({
        name: "用户管理",
        code: "system:user",
        type: "menu",
        path: "user",
        parentId: system.id,
        component: "system/user/index",
        icon: "#",
        hidden: false,
        meta: { title: "用户管理", icon: "#", noCache: false, link: null },
        description: "用户管理菜单",
      });
      await Resource.create({
        name: "角色管理",
        code: "system:role",
        type: "menu",
        path: "role",
        parentId: system.id,
        component: "system/role/index",
        icon: "#",
        hidden: false,
        meta: { title: "角色管理", icon: "#", noCache: false, link: null },
        description: "角色管理菜单",
      });
      await Resource.create({
        name: "资源管理",
        code: "system:resource",
        type: "menu",
        path: "resource",
        parentId: system.id,
        component: "system/resource/index",
        icon: "#",
        hidden: false,
        meta: { title: "资源管理", icon: "#", noCache: false, link: null },
        description: "资源管理菜单",
      });
      const category = await Resource.create({
        name: "分类管理",
        code: "category",
        type: "menu",
        path: "/category",
        component: "Layout",
        icon: "分类",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: { title: "分类管理", icon: "分类", noCache: false, link: null },
        description: "分类管理模块",
      });
      await Resource.create({
        name: "分类类型管理",
        code: "category:type",
        type: "menu",
        path: "type",
        parentId: category.id,
        component: "category/type/index",
        icon: "#",
        hidden: false,
        meta: { title: "分类类型管理", icon: "#", noCache: false, link: null },
        description: "分类类型管理菜单",
      });
      await Resource.create({
        name: "分类管理",
        code: "category:category",
        type: "menu",
        path: "category",
        parentId: category.id,
        component: "category/category/index",
        icon: "#",
        hidden: false,
        meta: { title: "分类管理", icon: "#", noCache: false, link: null },
        description: "分类管理菜单",
      });

      // 3. 角色
      const adminRole = await Role.create({
        name: "管理员",
        code: "admin",
        description: "系统管理员",
      });
      const managerRole = await Role.create({
        name: "高级管理员",
        code: "manager",
        description: "高级管理员",
      });
      const userRole = await Role.create({
        name: "普通管理员",
        code: "user",
        description: "普通管理员",
      });

      // 4. 角色-权限分配
      // admin 拥有所有权限
      await adminRole.setPermissions(permissions);
      // manager 只拥有分类类型和分类管理的增删改查
      const managerPerms = permissions.filter((p) =>
        [
          "manage_categories",
          "view_categories",
          "manage_category",
          "view_category",
        ].includes(p.name)
      );
      await managerRole.setPermissions(managerPerms);
      // user 只拥有分类管理-查
      const userPerms = permissions.filter((p) =>
        ["view_category"].includes(p.name)
      );
      await userRole.setPermissions(userPerms);

      // 5. 创建用户并分配角色
      const adminUser = await User.create({
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        status: 1,
      });
      await adminUser.addRole(adminRole);

      const managerUser = await User.create({
        username: "manager",
        password: "manager123",
        email: "manager@example.com",
        status: 1,
      });
      await managerUser.addRole(managerRole);

      const normalUser = await User.create({
        username: "user",
        password: "user123",
        email: "user@example.com",
        status: 1,
      });
      await normalUser.addRole(userRole);

      console.log("核心初始数据创建完成！");
    } catch (error) {
      console.error("初始数据创建失败：", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await clearDatabase();
  },
};
