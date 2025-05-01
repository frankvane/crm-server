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
      console.log("数据库清理完成");
      console.log("开始创建核心初始数据...");

      // 1. 先创建资源菜单
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
        meta: JSON.stringify({
          title: "系统管理",
          icon: "系统",
          noCache: false,
          link: null,
        }),
        description: "系统管理模块",
      });

      const userResource = await Resource.create({
        name: "用户管理",
        code: "system:user",
        type: "menu",
        path: "user",
        parentId: system.id,
        component: "system/user/index",
        icon: "#",
        hidden: false,
        meta: JSON.stringify({
          title: "用户管理",
          icon: "#",
          noCache: false,
          link: null,
        }),
        description: "用户管理菜单",
      });

      const roleResource = await Resource.create({
        name: "角色管理",
        code: "system:role",
        type: "menu",
        path: "role",
        parentId: system.id,
        component: "system/role/index",
        icon: "#",
        hidden: false,
        meta: JSON.stringify({
          title: "角色管理",
          icon: "#",
          noCache: false,
          link: null,
        }),
        description: "角色管理菜单",
      });

      const resourceResource = await Resource.create({
        name: "资源管理",
        code: "system:resource",
        type: "menu",
        path: "resource",
        parentId: system.id,
        component: "system/resource/index",
        icon: "#",
        hidden: false,
        meta: JSON.stringify({
          title: "资源管理",
          icon: "#",
          noCache: false,
          link: null,
        }),
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
        meta: JSON.stringify({
          title: "分类管理",
          icon: "分类",
          noCache: false,
          link: null,
        }),
        description: "分类管理模块",
      });

      const categoryTypeResource = await Resource.create({
        name: "分类类型管理",
        code: "category:type",
        type: "menu",
        path: "type",
        parentId: category.id,
        component: "category/type/index",
        icon: "#",
        hidden: false,
        meta: JSON.stringify({
          title: "分类类型管理",
          icon: "#",
          noCache: false,
          link: null,
        }),
        description: "分类类型管理菜单",
      });

      const categoryResource = await Resource.create({
        name: "分类管理",
        code: "category:category",
        type: "menu",
        path: "category",
        parentId: category.id,
        component: "category/category/index",
        icon: "#",
        hidden: false,
        meta: JSON.stringify({
          title: "分类管理",
          icon: "#",
          noCache: false,
          link: null,
        }),
        description: "分类管理菜单",
      });

      // 2. 创建资源操作
      const createResourceActions = async (resource, actions) => {
        const createdActions = await ResourceAction.bulkCreate(
          actions.map((action) => ({
            name: action.name,
            code: `${resource.code}:${action.code}`,
            description: action.description,
            icon: action.icon || null,
            sort: action.sort || 0,
            needConfirm: action.needConfirm || false,
            confirmMessage: action.confirmMessage || null,
            resourceId: resource.id,
          }))
        );

        // 为每个操作创建对应的权限
        const permissions = await Permission.bulkCreate(
          createdActions.map((action) => ({
            name: `${action.code}`,
            code: `${action.code}`,
            description: `${action.description}`,
            actionId: action.id,
            resourceId: resource.id,
          }))
        );

        return { actions: createdActions, permissions };
      };

      // 用户管理操作
      await createResourceActions(userResource, [
        { name: "新增", code: "add", description: "新增用户" },
        { name: "编辑", code: "edit", description: "编辑用户" },
        {
          name: "删除",
          code: "delete",
          description: "删除用户",
          needConfirm: true,
          confirmMessage: "确定要删除该用户吗？",
        },
        { name: "导出", code: "export", description: "导出用户数据" },
      ]);

      // 角色管理操作
      await createResourceActions(roleResource, [
        { name: "新增", code: "add", description: "新增角色" },
        { name: "编辑", code: "edit", description: "编辑角色" },
        {
          name: "删除",
          code: "delete",
          description: "删除角色",
          needConfirm: true,
          confirmMessage: "确定要删除该角色吗？",
        },
        { name: "分配权限", code: "assign", description: "分配角色权限" },
      ]);

      // 资源管理操作
      await createResourceActions(resourceResource, [
        { name: "新增", code: "add", description: "新增资源" },
        { name: "编辑", code: "edit", description: "编辑资源" },
        {
          name: "删除",
          code: "delete",
          description: "删除资源",
          needConfirm: true,
          confirmMessage: "确定要删除该资源吗？",
        },
      ]);

      // 分类类型管理操作
      await createResourceActions(categoryTypeResource, [
        { name: "新增", code: "add", description: "新增分类类型" },
        { name: "编辑", code: "edit", description: "编辑分类类型" },
        {
          name: "删除",
          code: "delete",
          description: "删除分类类型",
          needConfirm: true,
          confirmMessage: "确定要删除该分类类型吗？",
        },
      ]);

      // 分类管理操作
      await createResourceActions(categoryResource, [
        { name: "新增", code: "add", description: "新增分类" },
        { name: "编辑", code: "edit", description: "编辑分类" },
        {
          name: "删除",
          code: "delete",
          description: "删除分类",
          needConfirm: true,
          confirmMessage: "确定要删除该分类吗？",
        },
      ]);

      // 3. 创建角色
      const adminRole = await Role.create({
        name: "管理员",
        code: "admin",
        description: "系统管理员",
      });

      // 4. 创建管理员用户
      const adminUser = await User.create({
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        email: "admin@example.com",
        status: 1,
      });

      // 5. 为管理员用户分配角色
      await adminUser.addRole(adminRole);

      // 6. 为管理员角色分配所有资源和权限
      const allResources = await Resource.findAll();
      await adminRole.addResources(allResources);

      const allPermissions = await Permission.findAll();
      await adminRole.addPermissions(allPermissions);

      console.log("初始数据创建成功");
    } catch (error) {
      console.error("初始数据创建失败：", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await clearDatabase();
  },
};
