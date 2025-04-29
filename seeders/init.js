const bcrypt = require("bcryptjs");
const { User, Role, Permission, CategoryType, Category } = require("../models");

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

    // 6. 创建默认分类类型
    const [menuType, productType] = await CategoryType.bulkCreate([
      {
        name: "系统菜单",
        code: "menu",
        description: "系统菜单分类",
        status: true,
      },
      {
        name: "产品管理",
        code: "product",
        description: "产品相关分类",
        status: true,
      },
    ]);

    // 7. 创建系统菜单分类
    const systemManage = await Category.create({
      name: "系统管理",
      code: "system-manage",
      typeId: menuType.id,
      sort: 1,
      description: "系统管理相关功能",
    });

    await Category.bulkCreate([
      {
        name: "用户管理",
        code: "system-user",
        parentId: systemManage.id,
        typeId: menuType.id,
        sort: 1,
      },
      {
        name: "角色管理",
        code: "system-role",
        parentId: systemManage.id,
        typeId: menuType.id,
        sort: 2,
      },
      {
        name: "权限管理",
        code: "system-permission",
        parentId: systemManage.id,
        typeId: menuType.id,
        sort: 3,
      },
      {
        name: "分类管理",
        code: "system-category",
        parentId: systemManage.id,
        typeId: menuType.id,
        sort: 4,
      },
    ]);

    // 创建产品相关菜单分类
    const productManage = await Category.create({
      name: "产品管理",
      code: "product-manage",
      typeId: menuType.id,
      sort: 2,
      description: "产品管理相关功能",
    });

    await Category.bulkCreate([
      {
        name: "产品列表",
        code: "product-manage-list",
        parentId: productManage.id,
        typeId: menuType.id,
        sort: 1,
      },
      {
        name: "品牌管理",
        code: "product-manage-brand",
        parentId: productManage.id,
        typeId: menuType.id,
        sort: 2,
      },
      {
        name: "分类管理",
        code: "product-manage-category",
        parentId: productManage.id,
        typeId: menuType.id,
        sort: 3,
      },
    ]);

    // 创建产品分类数据
    const productCategory = await Category.create({
      name: "所有产品",
      code: "product-all",
      typeId: productType.id,
      sort: 1,
      description: "产品分类",
    });

    await Category.bulkCreate([
      {
        name: "电子产品",
        code: "product-electronics",
        parentId: productCategory.id,
        typeId: productType.id,
        sort: 1,
      },
      {
        name: "家具用品",
        code: "product-furniture",
        parentId: productCategory.id,
        typeId: productType.id,
        sort: 2,
      },
      {
        name: "办公用品",
        code: "product-office",
        parentId: productCategory.id,
        typeId: productType.id,
        sort: 3,
      },
    ]);

    console.log("Initial data created successfully!");
    return { adminUser, adminRole, userRole, permissions };
  } catch (error) {
    console.error("Error creating initial data:", error);
    throw error;
  }
}

module.exports = createInitialData;
