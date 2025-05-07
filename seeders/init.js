"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 自动清空所有相关表，避免唯一约束冲突
    await queryInterface.bulkDelete("role_permissions", null, {});
    await queryInterface.bulkDelete("user_roles", null, {});
    await queryInterface.bulkDelete("role_resources", null, {});
    await queryInterface.bulkDelete("refresh_tokens", null, {});
    await queryInterface.bulkDelete("categories", null, {});
    await queryInterface.bulkDelete("category_types", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
    await queryInterface.bulkDelete("resource_actions", null, {});
    await queryInterface.bulkDelete("resources", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("users", null, {});

    const now = new Date();
    try {
      // 1. 插入一级菜单
      await queryInterface.bulkInsert(
        "resources",
        [
          {
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
            createdAt: now,
            updatedAt: now,
          },
          {
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
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 查询一级菜单 id
      const [systemMenu] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system'"
      );
      const [categoryMenu] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'category'"
      );
      // 2. 用查到的 id 作为 parentId 插入子菜单
      await queryInterface.bulkInsert(
        "resources",
        [
          // 系统管理下
          {
            name: "用户管理",
            code: "system:user",
            type: "menu",
            path: "user",
            parentId: systemMenu[0].id,
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
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "角色管理",
            code: "system:role",
            type: "menu",
            path: "role",
            parentId: systemMenu[0].id,
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
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "资源管理",
            code: "system:resource",
            type: "menu",
            path: "resource",
            parentId: systemMenu[0].id,
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
            createdAt: now,
            updatedAt: now,
          },
          // 分类管理下
          {
            name: "分类类型管理",
            code: "category:type",
            type: "menu",
            path: "type",
            parentId: categoryMenu[0].id,
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
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "分类管理",
            code: "category:category",
            type: "menu",
            path: "category",
            parentId: categoryMenu[0].id,
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
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 查询子菜单 id
      const [userMenu] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system:user'"
      );
      const [roleMenu] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system:role'"
      );
      const [resourceMenu] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system:resource'"
      );
      const [categoryTypeMenu] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'category:type'"
      );
      const [categoryMenuSub] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'category:category'"
      );
      // 2. 资源操作
      await queryInterface.bulkInsert(
        "resource_actions",
        [
          // 用户管理
          {
            name: "新增",
            code: "system:user:add",
            description: "新增用户",
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "编辑",
            code: "system:user:edit",
            description: "编辑用户",
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "删除",
            code: "system:user:delete",
            description: "删除用户",
            needConfirm: true,
            confirmMessage: "确定要删除该用户吗？",
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "导出",
            code: "system:user:export",
            description: "导出用户数据",
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 角色管理
          {
            name: "新增",
            code: "system:role:add",
            description: "新增角色",
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "编辑",
            code: "system:role:edit",
            description: "编辑角色",
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "删除",
            code: "system:role:delete",
            description: "删除角色",
            needConfirm: true,
            confirmMessage: "确定要删除该角色吗？",
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "分配权限",
            code: "system:role:assign",
            description: "分配角色权限",
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 资源管理
          {
            name: "新增",
            code: "system:resource:add",
            description: "新增资源",
            resourceId: resourceMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "编辑",
            code: "system:resource:edit",
            description: "编辑资源",
            resourceId: resourceMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "删除",
            code: "system:resource:delete",
            description: "删除资源",
            needConfirm: true,
            confirmMessage: "确定要删除该资源吗？",
            resourceId: resourceMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 分类类型管理
          {
            name: "新增",
            code: "category:type:add",
            description: "新增分类类型",
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "编辑",
            code: "category:type:edit",
            description: "编辑分类类型",
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "删除",
            code: "category:type:delete",
            description: "删除分类类型",
            needConfirm: true,
            confirmMessage: "确定要删除该分类类型吗？",
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "查看",
            code: "category:type:view",
            description: "查看分类类型",
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 分类管理
          {
            name: "新增",
            code: "category:category:add",
            description: "新增分类",
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "编辑",
            code: "category:category:edit",
            description: "编辑分类",
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "删除",
            code: "category:category:delete",
            description: "删除分类",
            needConfirm: true,
            confirmMessage: "确定要删除该分类吗？",
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "查看",
            code: "category:category:view",
            description: "查看分类",
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 查询 resource_actions 的 id
      const [userAddAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:user:add'"
      );
      const [userEditAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:user:edit'"
      );
      const [userDeleteAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:user:delete'"
      );
      const [userExportAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:user:export'"
      );
      const [roleAddAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:role:add'"
      );
      const [roleEditAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:role:edit'"
      );
      const [roleDeleteAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:role:delete'"
      );
      const [roleAssignAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:role:assign'"
      );
      const [resourceAddAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:resource:add'"
      );
      const [resourceEditAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:resource:edit'"
      );
      const [resourceDeleteAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'system:resource:delete'"
      );
      const [categoryTypeAddAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:type:add'"
      );
      const [categoryTypeEditAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:type:edit'"
      );
      const [categoryTypeDeleteAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:type:delete'"
      );
      const [categoryTypeViewAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:type:view'"
      );
      const [categoryAddAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:category:add'"
      );
      const [categoryEditAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:category:edit'"
      );
      const [categoryDeleteAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:category:delete'"
      );
      const [categoryViewAction] = await queryInterface.sequelize.query(
        "SELECT id FROM resource_actions WHERE code = 'category:category:view'"
      );
      // 3. 权限
      await queryInterface.bulkInsert(
        "permissions",
        [
          // 用户管理
          {
            name: "system:user:add",
            code: "system:user:add",
            description: "新增用户",
            actionId: userAddAction[0].id,
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:user:edit",
            code: "system:user:edit",
            description: "编辑用户",
            actionId: userEditAction[0].id,
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:user:delete",
            code: "system:user:delete",
            description: "删除用户",
            actionId: userDeleteAction[0].id,
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:user:export",
            code: "system:user:export",
            description: "导出用户数据",
            actionId: userExportAction[0].id,
            resourceId: userMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 角色管理
          {
            name: "system:role:add",
            code: "system:role:add",
            description: "新增角色",
            actionId: roleAddAction[0].id,
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:role:edit",
            code: "system:role:edit",
            description: "编辑角色",
            actionId: roleEditAction[0].id,
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:role:delete",
            code: "system:role:delete",
            description: "删除角色",
            actionId: roleDeleteAction[0].id,
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:role:assign",
            code: "system:role:assign",
            description: "分配角色权限",
            actionId: roleAssignAction[0].id,
            resourceId: roleMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 资源管理
          {
            name: "system:resource:add",
            code: "system:resource:add",
            description: "新增资源",
            actionId: resourceAddAction[0].id,
            resourceId: resourceMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:resource:edit",
            code: "system:resource:edit",
            description: "编辑资源",
            actionId: resourceEditAction[0].id,
            resourceId: resourceMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "system:resource:delete",
            code: "system:resource:delete",
            description: "删除资源",
            actionId: resourceDeleteAction[0].id,
            resourceId: resourceMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 分类类型管理
          {
            name: "category:type:add",
            code: "category:type:add",
            description: "新增分类类型",
            actionId: categoryTypeAddAction[0].id,
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "category:type:edit",
            code: "category:type:edit",
            description: "编辑分类类型",
            actionId: categoryTypeEditAction[0].id,
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "category:type:delete",
            code: "category:type:delete",
            description: "删除分类类型",
            actionId: categoryTypeDeleteAction[0].id,
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "category:type:view",
            code: "category:type:view",
            description: "查看分类类型",
            actionId: categoryTypeViewAction[0].id,
            resourceId: categoryTypeMenu[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 分类管理
          {
            name: "category:category:add",
            code: "category:category:add",
            description: "新增分类",
            actionId: categoryAddAction[0].id,
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "category:category:edit",
            code: "category:category:edit",
            description: "编辑分类",
            actionId: categoryEditAction[0].id,
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "category:category:delete",
            code: "category:category:delete",
            description: "删除分类",
            actionId: categoryDeleteAction[0].id,
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "category:category:view",
            code: "category:category:view",
            description: "查看分类",
            actionId: categoryViewAction[0].id,
            resourceId: categoryMenuSub[0].id,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 4. 角色
      await queryInterface.bulkInsert(
        "roles",
        [
          {
            name: "管理员",
            code: "admin",
            description: "系统管理员，拥有所有权限",
            status: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "经理",
            code: "manager",
            description: "部门经理，拥有部分管理权限",
            status: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "用户",
            code: "user",
            description: "普通用户，仅拥有基本权限",
            status: 1,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 5. 用户
      await queryInterface.bulkInsert(
        "users",
        [
          {
            username: "admin",
            password: await bcrypt.hash("admin123", 10),
            email: "admin@example.com",
            status: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            username: "manager",
            password: await bcrypt.hash("manager123", 10),
            email: "manager@example.com",
            status: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            username: "user",
            password: await bcrypt.hash("user123", 10),
            email: "user@example.com",
            status: 1,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 6. 分类类型与分类
      await queryInterface.bulkInsert(
        "category_types",
        [
          {
            name: "菜单",
            code: "menu",
            description: "菜单类型",
            status: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "产品",
            code: "product",
            description: "产品类型",
            status: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "文章",
            code: "article",
            description: "文章类型",
            status: true,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 查询 category_types 的 id
      const [menuType] = await queryInterface.sequelize.query(
        "SELECT id FROM category_types WHERE code = 'menu'"
      );
      const [productType] = await queryInterface.sequelize.query(
        "SELECT id FROM category_types WHERE code = 'product'"
      );
      const [articleType] = await queryInterface.sequelize.query(
        "SELECT id FROM category_types WHERE code = 'article'"
      );
      await queryInterface.bulkInsert(
        "categories",
        [
          {
            name: "一级菜单",
            code: "menu1",
            parentId: null,
            typeId: menuType[0].id,
            description: "一级菜单",
            sort: 1,
            status: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "产品A",
            code: "productA",
            parentId: null,
            typeId: productType[0].id,
            description: "产品A",
            sort: 1,
            status: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            name: "文章A",
            code: "articleA",
            parentId: null,
            typeId: articleType[0].id,
            description: "文章A",
            sort: 1,
            status: true,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 查询角色 id
      const [adminRole] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE code = 'admin'"
      );
      const [managerRole] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE code = 'manager'"
      );
      const [userRole] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE code = 'user'"
      );
      // 查询资源 id
      const [systemRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system'"
      );
      const [categoryRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'category'"
      );
      const [userRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system:user'"
      );
      const [roleRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system:role'"
      );
      const [resourceRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'system:resource'"
      );
      const [categoryTypeRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'category:type'"
      );
      const [categoryMenuRes] = await queryInterface.sequelize.query(
        "SELECT id FROM resources WHERE code = 'category:category'"
      );
      // 插入 role_resources
      await queryInterface.bulkInsert(
        "role_resources",
        [
          {
            roleId: adminRole[0].id,
            resourceId: systemRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: adminRole[0].id,
            resourceId: categoryRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: adminRole[0].id,
            resourceId: userRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: adminRole[0].id,
            resourceId: roleRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: adminRole[0].id,
            resourceId: resourceRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: adminRole[0].id,
            resourceId: categoryTypeRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: adminRole[0].id,
            resourceId: categoryMenuRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 经理
          {
            roleId: managerRole[0].id,
            resourceId: userRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: managerRole[0].id,
            resourceId: categoryTypeRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: managerRole[0].id,
            resourceId: categoryMenuRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          // 普通用户
          {
            roleId: userRole[0].id,
            resourceId: categoryTypeRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            roleId: userRole[0].id,
            resourceId: categoryMenuRes[0].id,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
      // 查询权限 id
      const [permissions] = await queryInterface.sequelize.query(
        "SELECT id, code FROM permissions"
      );
      // 插入 role_permissions
      await queryInterface.bulkInsert(
        "role_permissions",
        [
          ...permissions
            .filter((p) => p.code)
            .map((p) => ({
              roleId: adminRole[0].id,
              permissionId: p.id,
              createdAt: now,
              updatedAt: now,
            })),
          // 经理权限
          ...permissions
            .filter((p) =>
              [
                "system:user:add",
                "system:user:edit",
                "system:user:delete",
                "system:user:export",
                "category:category:edit",
                "category:category:delete",
                "category:category:view",
                "category:category:add",
              ].includes(p.code)
            )
            .map((p) => ({
              roleId: managerRole[0].id,
              permissionId: p.id,
              createdAt: now,
              updatedAt: now,
            })),
          // 普通用户权限
          ...permissions
            .filter((p) =>
              ["category:category:view", "category:type:view"].includes(p.code)
            )
            .map((p) => ({
              roleId: userRole[0].id,
              permissionId: p.id,
              createdAt: now,
              updatedAt: now,
            })),
        ],
        { ignoreDuplicates: true }
      );
      // 查询用户 id
      const [adminUser] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE username = 'admin'"
      );
      const [managerUser] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE username = 'manager'"
      );
      const [normalUser] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE username = 'user'"
      );
      // 插入 user_roles
      await queryInterface.bulkInsert(
        "user_roles",
        [
          {
            userId: adminUser[0].id,
            roleId: adminRole[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            userId: managerUser[0].id,
            roleId: managerRole[0].id,
            createdAt: now,
            updatedAt: now,
          },
          {
            userId: normalUser[0].id,
            roleId: userRole[0].id,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true }
      );
    } catch (error) {
      console.error("Seed error:", error);
      if (error.errors) {
        error.errors.forEach((e) => console.error(e.message, e.path, e.value));
      }
      // 不抛出错误，自动跳过
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
    await queryInterface.bulkDelete("resources", null, {});
    await queryInterface.bulkDelete("resource_actions", null, {});
    await queryInterface.bulkDelete("role_permissions", null, {});
    await queryInterface.bulkDelete("role_resources", null, {});
    await queryInterface.bulkDelete("user_roles", null, {});
    await queryInterface.bulkDelete("category_types", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
