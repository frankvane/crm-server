"use strict";

const {
  User,
  Role,
  Permission,
  Resource,
  ResourceAction,
  CategoryType,
  Category,
} = require("../models");
const bcrypt = require("bcryptjs");

module.exports = {
  async up() {
    try {
      // 1. 清空所有表
      await Permission.sequelize.query("DELETE FROM role_permissions");
      await Permission.sequelize.query("DELETE FROM user_roles");
      await Permission.sequelize.query("DELETE FROM role_resources");
      await Permission.sequelize.query("DELETE FROM refresh_tokens");
      await Permission.sequelize.query("DELETE FROM categories");
      await Permission.sequelize.query("DELETE FROM category_types");
      await Permission.sequelize.query("DELETE FROM permissions");
      await Permission.sequelize.query("DELETE FROM resource_actions");
      await Permission.sequelize.query("DELETE FROM resources");
      await Permission.sequelize.query("DELETE FROM roles");
      await Permission.sequelize.query("DELETE FROM users");

      // 2. 资源菜单
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
      // 商品订单主菜单及子菜单
      const orderMenu = await Resource.create({
        name: "商品订单",
        code: "goods-order",
        type: "menu",
        path: "goods-order",
        component: "/layouts/BasicLayout",
        icon: "ShoppingCartOutlined",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: JSON.stringify({
          title: "商品订单",
          icon: "ShoppingCartOutlined",
          noCache: false,
          link: null,
        }),
        description: "商品订单模块",
      });
      const albumResource = await Resource.create({
        name: "相册管理",
        code: "goods-order:albums",
        type: "menu",
        path: "albums",
        parentId: orderMenu.id,
        component: "/pages/goods-order/albums",
        icon: "PictureOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "相册管理",
          icon: "PictureOutlined",
          noCache: false,
          link: null,
        }),
        description: "商品相册管理菜单",
      });
      const productResource = await Resource.create({
        name: "产品管理",
        code: "goods-order:products",
        type: "menu",
        path: "products",
        parentId: orderMenu.id,
        component: "/pages/goods-order/products",
        icon: "GiftOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "产品管理",
          icon: "GiftOutlined",
          noCache: false,
          link: null,
        }),
        description: "商品产品管理菜单",
      });
      const orderResource = await Resource.create({
        name: "订单管理",
        code: "goods-order:orders",
        type: "menu",
        path: "orders",
        parentId: orderMenu.id,
        component: "/pages/goods-order/orders",
        icon: "OrderedListOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "订单管理",
          icon: "OrderedListOutlined",
          noCache: false,
          link: null,
        }),
        description: "商品订单管理菜单",
      });
      const logisticsResource = await Resource.create({
        name: "物流管理",
        code: "goods-order:logistics",
        type: "menu",
        path: "logistics",
        parentId: orderMenu.id,
        component: "/pages/goods-order/logistics",
        icon: "CarOutlined",
        hidden: false,
        meta: JSON.stringify({
          title: "物流管理",
          icon: "CarOutlined",
          noCache: false,
          link: null,
        }),
        description: "商品物流管理菜单",
      });

      // 2. 创建资源操作和权限
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
        { name: "查看", code: "view", description: "查看分类" },
      ]);
      // 商品订单相关操作
      const commonActions = [
        { name: "新增", code: "add", description: "新增" },
        { name: "编辑", code: "edit", description: "编辑" },
        {
          name: "删除",
          code: "delete",
          description: "删除",
          needConfirm: true,
          confirmMessage: "确定要删除吗？",
        },
        { name: "查看", code: "view", description: "查看" },
        { name: "导出", code: "export", description: "导出" },
      ];
      await createResourceActions(albumResource, commonActions);
      await createResourceActions(productResource, commonActions);
      await createResourceActions(orderResource, commonActions);
      await createResourceActions(logisticsResource, commonActions);
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
      // 经理拥有用户管理和分类管理权限和仪表盘
      const managerResources = [
        dashboardResource,
        userResource,
        categoryMenu,
        categoryTypeResource,
        categoryResource,
        orderMenu,
        albumResource,
        productResource,
        orderResource,
        logisticsResource,
      ];
      await managerRole.setResources(managerResources);
      // 设置经理的权限
      const managerPermissions = allPermissions.filter((permission) => {
        const code = permission.code;
        return (
          code.startsWith("permission:users:") ||
          code.startsWith("category:category-types:") ||
          code.startsWith("category:categories:") ||
          code.startsWith("goods-order:albums:") ||
          code.startsWith("goods-order:products:") ||
          code.startsWith("goods-order:orders:") ||
          code.startsWith("goods-order:logistics:")
        );
      });
      await managerRole.setPermissions(managerPermissions);
      // 普通用户只有分类查看权限和仪表盘
      const userResources = [
        dashboardResource,
        categoryMenu,
        categoryTypeResource,
        categoryResource,
        orderMenu,
        albumResource,
        productResource,
        orderResource,
        logisticsResource,
      ];
      await userRole.setResources(userResources);
      // 设置普通用户的权限
      const userPermissions = allPermissions.filter((permission) => {
        const code = permission.code;
        return (
          code === "category:category-types:view" ||
          code === "category:categories:view" ||
          code === "goods-order:albums:view" ||
          code === "goods-order:products:view" ||
          code === "goods-order:orders:view" ||
          code === "goods-order:logistics:view"
        );
      });
      await userRole.setPermissions(userPermissions);
      // 5. 创建用户（密码为明文，便于测试登录）
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

      // 7. 分类类型与分类（药品/适应症/剂型/用法/储存条件）
      // 1. 分类类型
      const categoryTypes = [
        {
          name: "药品分类",
          code: "MEDICINE_TYPE",
          description: "药品的基本分类，包括处方药、非处方药等",
          status: 1,
        },
        {
          name: "适应症分类",
          code: "INDICATION_TYPE",
          description: "药品适应症分类，包括各类疾病领域",
          status: 1,
        },
        {
          name: "剂型分类",
          code: "DOSAGE_FORM_TYPE",
          description: "药品剂型分类，包括片剂、胶囊剂等",
          status: 1,
        },
        {
          name: "使用方式",
          code: "USAGE_TYPE",
          description: "药品使用方式分类，包括口服、注射等",
          status: 1,
        },
        {
          name: "储存条件",
          code: "STORAGE_TYPE",
          description: "药品储存条件分类，包括常温、冷藏等",
          status: 1,
        },
      ];
      const typeMap = {};
      for (const t of categoryTypes) {
        const type = await CategoryType.create({ ...t });
        typeMap[t.code] = type.id;
      }
      // 2. 分类（含主分类和子分类）
      // 药品分类
      const rx = await Category.create({
        name: "处方药",
        code: "RX",
        typeId: typeMap["MEDICINE_TYPE"],
        parentId: null,
        sort: 1,
        description: "需要凭执业医师处方才可调配、购买和使用的药品",
        status: 1,
      });
      const otc = await Category.create({
        name: "非处方药",
        code: "OTC",
        typeId: typeMap["MEDICINE_TYPE"],
        parentId: null,
        sort: 2,
        description: "消费者可不经医生处方，直接从药房或药店购买的药品",
        status: 1,
      });
      await Category.create({
        name: "抗生素类",
        code: "RX_ANTIBIOTIC",
        typeId: typeMap["MEDICINE_TYPE"],
        parentId: rx.id,
        sort: 1,
        description: "用于治疗细菌感染的药物",
        status: 1,
      });
      await Category.create({
        name: "心血管用药",
        code: "RX_CARDIOVASCULAR",
        typeId: typeMap["MEDICINE_TYPE"],
        parentId: rx.id,
        sort: 2,
        description: "用于治疗心血管系统疾病的药物",
        status: 1,
      });
      await Category.create({
        name: "感冒用药",
        code: "OTC_COLD",
        typeId: typeMap["MEDICINE_TYPE"],
        parentId: otc.id,
        sort: 1,
        description: "用于治疗感冒症状的非处方药",
        status: 1,
      });
      // 适应症分类
      const cardiovascular = await Category.create({
        name: "心血管系统",
        code: "CARDIOVASCULAR",
        typeId: typeMap["INDICATION_TYPE"],
        parentId: null,
        sort: 1,
        description: "与心脏和血管相关的疾病",
        status: 1,
      });
      const digestive = await Category.create({
        name: "消化系统",
        code: "DIGESTIVE",
        typeId: typeMap["INDICATION_TYPE"],
        parentId: null,
        sort: 2,
        description: "与消化道相关的疾病",
        status: 1,
      });
      await Category.create({
        name: "高血压",
        code: "HYPERTENSION",
        typeId: typeMap["INDICATION_TYPE"],
        parentId: cardiovascular.id,
        sort: 1,
        description: "血压持续升高的疾病",
        status: 1,
      });
      // 剂型分类
      const oralSolid = await Category.create({
        name: "口服固体制剂",
        code: "ORAL_SOLID",
        typeId: typeMap["DOSAGE_FORM_TYPE"],
        parentId: null,
        sort: 1,
        description: "以口服方式使用的固体药物制剂",
        status: 1,
      });
      await Category.create({
        name: "片剂",
        code: "TABLET",
        typeId: typeMap["DOSAGE_FORM_TYPE"],
        parentId: oralSolid.id,
        sort: 1,
        description: "药物与辅料混合压制成的片状制剂",
        status: 1,
      });
      await Category.create({
        name: "胶囊剂",
        code: "CAPSULE",
        typeId: typeMap["DOSAGE_FORM_TYPE"],
        parentId: oralSolid.id,
        sort: 2,
        description: "将药物装入空心胶囊中的制剂",
        status: 1,
      });
      // 使用方式
      const oral = await Category.create({
        name: "口服给药",
        code: "ORAL",
        typeId: typeMap["USAGE_TYPE"],
        parentId: null,
        sort: 1,
        description: "通过口服方式服用的药物",
        status: 1,
      });
      // 由于 INJECTION 主分类未定义，跳过静脉注射子分类
      // 储存条件
      await Category.create({
        name: "常温储存",
        code: "ROOM_TEMP",
        typeId: typeMap["STORAGE_TYPE"],
        parentId: null,
        sort: 1,
        description: "在室温条件下储存的药品",
        status: 1,
      });

      console.log("初始数据创建成功");
      return Promise.resolve();
    } catch (error) {
      console.error("初始数据创建失败:", error);
      return Promise.reject(error);
    }
  },
  async down() {
    await Permission.sequelize.query("DELETE FROM users");
    await Permission.sequelize.query("DELETE FROM roles");
    await Permission.sequelize.query("DELETE FROM permissions");
    await Permission.sequelize.query("DELETE FROM resources");
    await Permission.sequelize.query("DELETE FROM resource_actions");
    await Permission.sequelize.query("DELETE FROM role_permissions");
    await Permission.sequelize.query("DELETE FROM role_resources");
    await Permission.sequelize.query("DELETE FROM user_roles");
    await Permission.sequelize.query("DELETE FROM category_types");
    await Permission.sequelize.query("DELETE FROM categories");
  },
};
