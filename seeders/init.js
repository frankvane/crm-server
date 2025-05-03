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

      // 1. 先创建资源菜单（与前端路由完全一致，结构调整）

      // 仪表盘（一级菜单）
      const dashboardResource = await Resource.create({
        name: "仪表盘",
        code: "dashboard",
        type: "menu",
        path: "dashboard",
        component: "/pages/dashboard",
        icon: "DashboardOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "仪表盘",
          icon: "DashboardOutlined",
          noCache: false,
          link: null,
        }),
        description: "仪表盘页面",
      });

      // 权限管理（一级菜单）
      const permissionMenu = await Resource.create({
        name: "权限管理",
        code: "permission",
        type: "menu",
        path: "permission",
        component: "/layouts/BasicLayout",
        icon: "SettingOutlined",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: JSON.stringify({
          title: "权限管理",
          icon: "SettingOutlined",
          noCache: false,
          link: null,
        }),
        description: "权限管理模块",
      });

      // 角色管理（permission子菜单）
      const roleResource = await Resource.create({
        name: "角色管理",
        code: "permission:roles",
        type: "menu",
        path: "roles",
        parentId: permissionMenu.id,
        component: "/pages/permission/roles",
        icon: "TeamOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "角色管理",
          icon: "TeamOutlined",
          noCache: false,
          link: null,
        }),
        description: "角色管理菜单",
      });

      // 资源管理（permission子菜单）
      const resourceResource = await Resource.create({
        name: "资源管理",
        code: "permission:resources",
        type: "menu",
        path: "resources",
        parentId: permissionMenu.id,
        component: "/pages/permission/resources",
        icon: "AppstoreOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "资源管理",
          icon: "AppstoreOutlined",
          noCache: false,
          link: null,
        }),
        description: "资源管理菜单",
      });

      // 用户管理（permission子菜单）
      const userResource = await Resource.create({
        name: "用户管理",
        code: "permission:users",
        type: "menu",
        path: "users",
        parentId: permissionMenu.id,
        component: "/pages/permission/users",
        icon: "UserOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "用户管理",
          icon: "UserOutlined",
          noCache: false,
          link: null,
        }),
        description: "用户管理菜单",
      });

      // 分类管理（一级菜单）
      const categoryMenu = await Resource.create({
        name: "分类管理",
        code: "category",
        type: "menu",
        path: "category",
        component: "/layouts/BasicLayout",
        icon: "TagsOutlined",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: JSON.stringify({
          title: "分类管理",
          icon: "TagsOutlined",
          noCache: false,
          link: null,
        }),
        description: "分类管理模块",
      });

      // 分类类型（category子菜单）
      const categoryTypeResource = await Resource.create({
        name: "分类类型",
        code: "category:category-types",
        type: "menu",
        path: "category-types",
        parentId: categoryMenu.id,
        component: "/pages/category/category-types",
        icon: "BarsOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "分类类型",
          icon: "BarsOutlined",
          noCache: false,
          link: null,
        }),
        description: "分类类型菜单",
      });

      // 分类列表（category子菜单）
      const categoryResource = await Resource.create({
        name: "分类列表",
        code: "category:categories",
        type: "menu",
        path: "categories",
        parentId: categoryMenu.id,
        component: "/pages/category/categories",
        icon: "ProfileOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "分类列表",
          icon: "ProfileOutlined",
          noCache: false,
          link: null,
        }),
        description: "分类列表菜单",
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
        { name: "分配角色", code: "assign", description: "给用户分配角色" },
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
        { name: "查看", code: "view", description: "查看分类类型" },
      ]);

      // 分类管理操作
      const categoryActions = await createResourceActions(categoryResource, [
        { name: "新增", code: "add", description: "新增分类" },
        { name: "编辑", code: "edit", description: "编辑分类" },
        {
          name: "删除",
          code: "delete",
          description: "删除分类",
          needConfirm: true,
          confirmMessage: "确定要删除该分类吗？",
        },
        { name: "查看", code: "view", description: "查看分类" },
      ]);

      // 3. 创建角色
      const adminRole = await Role.create({
        name: "管理员",
        code: "admin",
        description: "系统管理员，拥有所有权限",
        status: 1,
      });

      const managerRole = await Role.create({
        name: "经理",
        code: "manager",
        description: "部门经理，拥有部分管理权限",
        status: 1,
      });

      const userRole = await Role.create({
        name: "用户",
        code: "user",
        description: "普通用户，仅拥有基本权限",
        status: 1,
      });

      // 4. 关联角色和资源，以及对应的权限
      // 获取所有权限
      const allPermissions = await Permission.findAll();

      // 管理员拥有所有资源和权限
      const allResources = await Resource.findAll();
      await adminRole.setResources(allResources);
      await adminRole.setPermissions(allPermissions);

      // 经理拥有用户管理和分类管理权限
      const managerResources = [
        userResource,
        categoryMenu,
        categoryTypeResource,
        categoryResource,
      ];
      await managerRole.setResources(managerResources);
      // 设置经理的权限
      const managerPermissions = allPermissions.filter((permission) => {
        const code = permission.code;
        return (
          code.startsWith("permission:users:") ||
          code.startsWith("category:category-types:") ||
          code.startsWith("category:categories:")
        );
      });
      await managerRole.setPermissions(managerPermissions);

      // 普通用户只有分类查看权限
      const userResources = [
        categoryMenu,
        categoryTypeResource,
        categoryResource,
      ];
      await userRole.setResources(userResources);
      // 设置普通用户的权限
      const userPermissions = allPermissions.filter((permission) => {
        const code = permission.code;
        return (
          code === "category:category-types:view" ||
          code === "category:categories:view"
        );
      });
      await userRole.setPermissions(userPermissions);

      // 5. 创建用户
      const adminUser = await User.create({
        username: "admin",
        password: "admin123",
        nickname: "系统管理员",
        email: "admin@example.com",
        status: 1,
      });

      const managerUser = await User.create({
        username: "manager",
        password: "manager123",
        nickname: "高级管理员",
        email: "manager@example.com",
        status: 1,
      });

      const normalUser = await User.create({
        username: "user",
        password: "user123",
        nickname: "普通管理员",
        email: "user@example.com",
        status: 1,
      });

      // 6. 分配用户角色
      await adminUser.addRole(adminRole);
      await managerUser.addRole(managerRole);
      await normalUser.addRole(userRole);

      console.log("初始数据创建成功");
      return Promise.resolve();
    } catch (error) {
      console.error("初始数据创建失败:", error);
      return Promise.reject(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await clearDatabase();
  },
};
