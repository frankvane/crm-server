首先分析整个项目，现在存在一个问题： 1.我希望获取用户信息的时候返回的数据结构内容类似于 data.json 中的结构，特别是三个部分的内容；
1）routes
2）rolesName
3）permissions

这样更有利于前端 Vue 框架进行 RBAC 的权限控制，因为 routes 对应前端的路由结构，permissions 事实上就是按钮的权限控制，当然，你也可以直接将 permissons 改成 buttons。

我们可以对指定的分类进行按钮权限的设置操作，利用 teachadmin:allstudents:get 标明分类、模块、操作权限。

所以整体的 RBAC 权限管理部分的逻辑是： 1.用户登陆，获取 accessToken、refreshToken； 2.获取用户信息，用户信息中包含 routes 路由、rolesName 角色清单、buttons 按钮权限控制清单 3.一个用户可以有多个角色
4，需要给角色分配资源权限 5.所谓资源权限就是对 category 分类当中 typeId 为 1 的内容进行控制，如果你建议将分类与资源菜单区别出来，那也是可以的，那要构建新的数据模型。 6.资源菜单是无限分类的，这相当于菜单级权限控制。 7.每个资源菜单下会有按钮级控制，你可以提建议，这一部分怎么样设计才会更好一些。比如：
1）用户管理这一菜单，我们可以对用户进行 query、add、update、delete、deleteMany、check 等
2）产品管理这一菜单，我们可以对产品进行 query、add、update、delete、deleteMany、上架、下架、审核等

# RBAC 权限系统改造方案详细流程

将资源菜单与分类完全分开，使用独立的 Resource 数据模型进行 RBAC 模块的控制。这样可以避免共用 Category 模型带来的混淆，同时也能更精确地实现 RBAC 权限控制。下面我来详细说明这个方案。

## 一、数据库模型改造

### 1. 创建 Resource 模型

```javascript
// models/resource.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Resource = sequelize.define("Resource", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "资源名称",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "资源代码",
    },
    type: {
      type: DataTypes.ENUM("menu", "button"),
      allowNull: false,
      defaultValue: "menu",
      comment: "资源类型：菜单或按钮",
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "前端路由路径",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "父级资源ID",
    },
    component: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "前端组件路径",
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "图标标识",
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "排序",
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否隐藏",
    },
    redirect: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "重定向路径",
    },
    alwaysShow: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "是否总是显示",
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "额外元数据",
      defaultValue: {
        title: "",
        icon: "",
        noCache: false,
        link: null,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "资源描述",
    },
  });

  Resource.associate = (models) => {
    // 自关联（树形结构）
    Resource.belongsTo(Resource, {
      foreignKey: "parentId",
      as: "parent",
    });
    Resource.hasMany(Resource, {
      foreignKey: "parentId",
      as: "children",
    });

    // 与角色的多对多关系
    Resource.belongsToMany(models.Role, {
      through: "RoleResource",
      foreignKey: "resourceId",
      otherKey: "roleId",
      as: "roles",
    });

    // 与ResourceAction的一对多关系
    Resource.hasMany(models.ResourceAction, {
      foreignKey: "resourceId",
      as: "actions",
    });
  };

  return Resource;
};
```

### 2. 创建 ResourceAction 模型

```javascript
// models/resourceAction.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResourceAction = sequelize.define("ResourceAction", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "操作名称，如'添加'、'编辑'",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "操作代码，如'add'、'edit'、'get'",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "操作描述",
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "操作图标",
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "排序",
    },
    needConfirm: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否需要二次确认",
    },
    confirmMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "确认提示信息",
    },
  });

  ResourceAction.associate = (models) => {
    // 与Resource的归属关系
    ResourceAction.belongsTo(models.Resource, {
      foreignKey: "resourceId",
      as: "resource",
    });
  };

  return ResourceAction;
};
```

### 3. 修改 Role 模型

```javascript
// models/role.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define("Role", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "角色名称",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "角色代码",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "角色描述",
    },
  });

  Role.associate = (models) => {
    // 角色与用户的多对多关系
    Role.belongsToMany(models.User, {
      through: "UserRole",
      foreignKey: "roleId",
      otherKey: "userId",
      as: "users",
    });

    // 角色与资源的多对多关系，替换原有的Permission关联
    Role.belongsToMany(models.Resource, {
      through: "RoleResource",
      foreignKey: "roleId",
      otherKey: "resourceId",
      as: "resources",
    });
  };

  return Role;
};
```

### 4. 创建角色资源关联表

```javascript
// models/roleResource.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoleResource = sequelize.define(
    "RoleResource",
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Resources",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    }
  );

  return RoleResource;
};
```

## 二、数据迁移

### 1. 创建 Resource 和 ResourceAction 表的迁移文件

```javascript
// migrations/XXXXXX-create-resource.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建Resource表
    await queryInterface.createTable("Resources", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("menu", "button"),
        allowNull: false,
        defaultValue: "menu",
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Resources",
          key: "id",
        },
      },
      component: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sort: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      redirect: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      alwaysShow: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      meta: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // 创建ResourceAction表
    await queryInterface.createTable("ResourceActions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Resources",
          key: "id",
        },
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sort: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      needConfirm: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      confirmMessage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // 创建RoleResource关联表
    await queryInterface.createTable("RoleResources", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Resources",
          key: "id",
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // 添加索引
    await queryInterface.addIndex("Resources", ["code"]);
    await queryInterface.addIndex("ResourceActions", ["resourceId", "code"]);
    await queryInterface.addIndex("RoleResources", ["roleId", "resourceId"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RoleResources");
    await queryInterface.dropTable("ResourceActions");
    await queryInterface.dropTable("Resources");
  },
};
```

### 2. 创建种子数据

根据 data.md 中的路由结构和权限数据，创建对应的种子文件：

```javascript
// seeders/XXXXXX-resource-seeder.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 插入顶级菜单
    const topMenus = [
      {
        name: "教学管理",
        code: "teachadmin",
        type: "menu",
        path: "teachadmin",
        component: "Layout",
        icon: "通知公告",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: JSON.stringify({
          title: "教学管理",
          icon: "通知公告",
          noCache: false,
          link: null,
        }),
        description: "教学管理模块",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "审批管理",
        code: "approval",
        type: "menu",
        path: "approval",
        component: "Layout",
        icon: "审批",
        hidden: false,
        redirect: "noRedirect",
        alwaysShow: true,
        meta: JSON.stringify({
          title: "审批管理",
          icon: "审批",
          noCache: false,
          link: null,
        }),
        description: "审批管理模块",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 添加其他顶级菜单...
    ];

    await queryInterface.bulkInsert("Resources", topMenus);

    // 获取插入的顶级菜单ID
    const teachadminMenu = await queryInterface.sequelize.query(
      `SELECT id FROM Resources WHERE code = 'teachadmin'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const teachadminId = teachadminMenu[0].id;

    // 插入二级菜单
    const subMenus = [
      {
        name: "全部学生列表",
        code: "teachadmin:allstudents",
        type: "menu",
        path: "allstudents",
        parentId: teachadminId,
        component: "teachadmin/allstudents/index",
        icon: "#",
        hidden: false,
        meta: JSON.stringify({
          title: "全部学生列表",
          icon: "#",
          noCache: false,
          link: null,
        }),
        description: "全部学生列表",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 添加更多二级菜单...
    ];

    await queryInterface.bulkInsert("Resources", subMenus);

    // 获取插入的二级菜单ID
    const allstudentsMenu = await queryInterface.sequelize.query(
      `SELECT id FROM Resources WHERE code = 'teachadmin:allstudents'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const allstudentsId = allstudentsMenu[0].id;

    // 插入按钮操作
    const actions = [
      {
        name: "查看学生列表",
        code: "get",
        resourceId: allstudentsId,
        description: "查看全部学生列表",
        icon: null,
        sort: 1,
        needConfirm: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "查询学生",
        code: "query",
        resourceId: allstudentsId,
        description: "搜索查询学生",
        icon: null,
        sort: 2,
        needConfirm: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "导出学生",
        code: "export",
        resourceId: allstudentsId,
        description: "导出学生数据",
        icon: null,
        sort: 3,
        needConfirm: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "更新学生信息",
        code: "update",
        resourceId: allstudentsId,
        description: "修改学生信息",
        icon: null,
        sort: 4,
        needConfirm: true,
        confirmMessage: "确定要修改该学生信息吗？",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 添加更多操作...
    ];

    await queryInterface.bulkInsert("ResourceActions", actions);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("ResourceActions", null, {});
    await queryInterface.bulkDelete("Resources", null, {});
  },
};
```

## 三、服务层实现

### 1. 创建权限服务

```javascript
// services/permission.service.js
const { User, Role, Resource, ResourceAction } = require("../models");
const { Op } = require("sequelize");

class PermissionService {
  /**
   * 获取用户的所有按钮权限
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} - 权限字符串数组
   */
  async getUserPermissions(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            include: [
              {
                model: Resource,
                as: "resources",
                include: [
                  {
                    model: ResourceAction,
                    as: "actions",
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!user) return [];

      const permissions = new Set();

      // 遍历用户的角色
      user.roles.forEach((role) => {
        // 遍历角色的资源
        role.resources.forEach((resource) => {
          // 添加菜单级权限
          if (resource.type === "menu") {
            permissions.add(`${resource.code}:view`);
          }

          // 遍历资源的操作
          resource.actions.forEach((action) => {
            // 构建权限字符串，格式：module:resource:action
            // 从resource.code中解析出模块和资源
            const parts = resource.code.split(":");
            const permissionStr =
              parts.length > 1
                ? `${resource.code}:${action.code}` // 已经包含模块，如 teachadmin:allstudents:get
                : `${resource.code}:${action.code}`; // 仅包含资源，如 allstudents:get

            permissions.add(permissionStr);
          });
        });
      });

      return [...permissions];
    } catch (error) {
      console.error("获取用户权限出错:", error);
      return [];
    }
  }

  /**
   * 构建用户路由树
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} - 路由配置数组
   */
  async buildUserRoutes(userId) {
    try {
      // 获取用户有权限的所有资源ID
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            include: [
              {
                model: Resource,
                as: "resources",
                attributes: ["id"],
              },
            ],
          },
        ],
      });

      if (!user) return [];

      // 收集用户有权限访问的资源ID
      const resourceIds = new Set();
      user.roles.forEach((role) => {
        role.resources.forEach((resource) => {
          resourceIds.add(resource.id);
        });
      });

      // 查询所有菜单类型的资源
      const menuResources = await Resource.findAll({
        where: {
          id: { [Op.in]: [...resourceIds] },
          type: "menu",
        },
        order: [
          ["sort", "ASC"],
          ["id", "ASC"],
        ],
      });

      // 构建路由树
      const buildRouteTree = (resources, parentId = null) => {
        return resources
          .filter((res) => res.parentId === parentId)
          .map((res) => {
            const meta =
              typeof res.meta === "string" ? JSON.parse(res.meta) : res.meta;

            // 转换为前端路由格式
            const route = {
              name: res.name,
              path: res.path,
              hidden: res.hidden || false,
              component: res.component,
            };

            if (meta) route.meta = meta;
            if (res.redirect) route.redirect = res.redirect;
            if (res.alwaysShow !== null) route.alwaysShow = res.alwaysShow;

            // 递归处理子菜单
            const children = buildRouteTree(resources, res.id);
            if (children.length > 0) {
              route.children = children;
            }

            return route;
          });
      };

      return buildRouteTree(menuResources);
    } catch (error) {
      console.error("构建用户路由出错:", error);
      return [];
    }
  }

  /**
   * 获取用户角色名称
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} - 角色名称数组
   */
  async getUserRoleNames(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["name"],
          },
        ],
      });

      if (!user) return [];

      return user.roles.map((role) => role.name);
    } catch (error) {
      console.error("获取用户角色名称出错:", error);
      return [];
    }
  }

  /**
   * 获取增强的用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 用户完整信息
   */
  async getEnhancedUserInfo(userId) {
    try {
      // 获取基本用户信息
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new Error("用户不存在");
      }

      // 获取用户角色名称
      const rolesName = await this.getUserRoleNames(userId);

      // 构建用户路由
      const routes = await this.buildUserRoutes(userId);

      // 获取按钮权限
      const permissions = await this.getUserPermissions(userId);

      // 返回增强的用户信息，格式与data.md一致
      return {
        ...user.get({ plain: true }),
        routes,
        rolesName,
        permissions,
        departmentName: user.departmentName || "默认部门",
        staffName: user.username,
        staffId: user.id,
      };
    } catch (error) {
      console.error("获取增强用户信息出错:", error);
      throw error;
    }
  }

  /**
   * 检查用户是否有指定权限
   * @param {number} userId - 用户ID
   * @param {string} permission - 权限标识
   * @returns {Promise<boolean>} - 是否有权限
   */
  async hasPermission(userId, permission) {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  /**
   * 检查用户是否有多个权限中的任意一个
   * @param {number} userId - 用户ID
   * @param {Array} permissions - 权限标识数组
   * @returns {Promise<boolean>} - 是否有权限
   */
  async hasAnyPermission(userId, permissions) {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((p) => userPermissions.includes(p));
  }
}

module.exports = new PermissionService();
```

### 2. 创建资源管理服务

```javascript
// services/resource.service.js
const { Resource, ResourceAction } = require("../models");

class ResourceService {
  /**
   * 创建新资源
   * @param {Object} resourceData - 资源数据
   * @param {Array} actions - 资源操作数据
   * @returns {Promise<Object>} - 创建的资源
   */
  async createResource(resourceData, actions = []) {
    try {
      // 创建资源
      const resource = await Resource.create(resourceData);

      // 创建资源操作
      if (actions && actions.length > 0) {
        const actionRecords = actions.map((action) => ({
          ...action,
          resourceId: resource.id,
        }));
        await ResourceAction.bulkCreate(actionRecords);
      }

      // 返回创建的资源（包含操作）
      return await Resource.findByPk(resource.id, {
        include: [{ model: ResourceAction, as: "actions" }],
      });
    } catch (error) {
      console.error("创建资源出错:", error);
      throw error;
    }
  }

  /**
   * 获取资源树
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 资源树
   */
  async getResourceTree(options = {}) {
    try {
      // 查询所有资源
      const resources = await Resource.findAll({
        include: [{ model: ResourceAction, as: "actions" }],
        order: [
          ["sort", "ASC"],
          ["id", "ASC"],
        ],
        ...options,
      });

      // 构建资源树
      const buildTree = (items, parentId = null) => {
        return items
          .filter((item) => item.parentId === parentId)
          .map((item) => {
            const children = buildTree(items, item.id);
            const node = item.get({ plain: true });

            if (children.length > 0) {
              node.children = children;
            }

            return node;
          });
      };

      return buildTree(resources);
    } catch (error) {
      console.error("获取资源树出错:", error);
      throw error;
    }
  }

  /**
   * 根据代码获取资源（包含操作）
   * @param {string} code - 资源代码
   * @returns {Promise<Object>} - 资源对象
   */
  async getResourceByCode(code) {
    try {
      return await Resource.findOne({
        where: { code },
        include: [{ model: ResourceAction, as: "actions" }],
      });
    } catch (error) {
      console.error("根据代码获取资源出错:", error);
      throw error;
    }
  }

  /**
   * 更新资源
   * @param {number} id - 资源ID
   * @param {Object} resourceData - 资源更新数据
   * @param {Array} actions - 资源操作数据
   * @returns {Promise<Object>} - 更新后的资源
   */
  async updateResource(id, resourceData, actions = null) {
    try {
      // 更新资源基本信息
      const resource = await Resource.findByPk(id);
      if (!resource) {
        throw new Error("资源不存在");
      }

      await resource.update(resourceData);

      // 如果提供了操作数据，则更新操作
      if (actions !== null) {
        // 删除现有操作
        await ResourceAction.destroy({
          where: { resourceId: id },
        });

        // 创建新操作
        if (actions.length > 0) {
          const actionRecords = actions.map((action) => ({
            ...action,
            resourceId: id,
          }));
          await ResourceAction.bulkCreate(actionRecords);
        }
      }

      // 返回更新后的资源（包含操作）
      return await Resource.findByPk(id, {
        include: [{ model: ResourceAction, as: "actions" }],
      });
    } catch (error) {
      console.error("更新资源出错:", error);
      throw error;
    }
  }
}

module.exports = new ResourceService();
```

## 四、控制器实现

### 1. 修改 Auth 控制器

```javascript
// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");
const { User } = require("../models");
const permissionService = require("../services/permission.service");
const ResponseUtil = require("../utils/response");

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res
        .status(401)
        .json(ResponseUtil.error("用户名或密码不正确", 401));
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(ResponseUtil.error("用户名或密码不正确", 401));
    }

    // 生成令牌
    const token = jwt.generateAccessToken(user.id);
    const refreshToken = jwt.generateRefreshToken(user.id);

    res.json(
      ResponseUtil.success(
        {
          token,
          refreshToken,
        },
        "登录成功"
      )
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 使用权限服务获取增强的用户信息
    const userInfo = await permissionService.getEnhancedUserInfo(userId);

    res.json(ResponseUtil.success(userInfo, "获取用户信息成功"));
  } catch (err) {
    next(err);
  }
};

// 保留其他登录相关方法...
```

### 2. 创建资源控制器

```javascript
// controllers/resource.controller.js
const resourceService = require("../services/resource.service");
const ResponseUtil = require("../utils/response");

exports.createResource = async (req, res, next) => {
  try {
    const { actions, ...resourceData } = req.body;

    const resource = await resourceService.createResource(
      resourceData,
      actions
    );

    res.status(201).json(ResponseUtil.success(resource, "资源创建成功"));
  } catch (err) {
    next(err);
  }
};

exports.getResourceTree = async (req, res, next) => {
  try {
    const { type } = req.query;

    const options = {};
    if (type) {
      options.where = { type };
    }

    const resourceTree = await resourceService.getResourceTree(options);

    res.json(ResponseUtil.success(resourceTree, "获取资源树成功"));
  } catch (err) {
    next(err);
  }
};

exports.updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actions, ...resourceData } = req.body;

    const resource = await resourceService.updateResource(
      id,
      resourceData,
      actions
    );

    res.json(ResponseUtil.success(resource, "资源更新成功"));
  } catch (err) {
    next(err);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否有子资源
    const childrenCount = await Resource.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return res
        .status(400)
        .json(ResponseUtil.error("无法删除，该资源存在子资源", 400));
    }

    // 删除关联的操作
    await ResourceAction.destroy({ where: { resourceId: id } });

    // 删除资源
    await Resource.destroy({ where: { id } });

    res.json(ResponseUtil.success(null, "资源删除成功"));
  } catch (err) {
    next(err);
  }
};
```

### 3. 修改角色控制器

```javascript
// controllers/role.controller.js
const { Role, Resource } = require("../models");
const ResponseUtil = require("../utils/response");

exports.createRole = async (req, res, next) => {
  try {
    const { name, code, description, resourceIds } = req.body;

    // 检查角色代码是否存在
    const existingRole = await Role.findOne({ where: { code } });
    if (existingRole) {
      return res.status(400).json(ResponseUtil.error("角色代码已存在", 400));
    }

    // 创建角色
    const role = await Role.create({ name, code, description });

    // 关联资源
    if (resourceIds && resourceIds.length > 0) {
      await role.setResources(resourceIds);
    }

    // 返回创建后的角色（包含关联的资源）
    const newRole = await Role.findByPk(role.id, {
      include: [{ model: Resource, as: "resources" }],
    });

    res.status(201).json(ResponseUtil.success(newRole, "角色创建成功"));
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, resourceIds } = req.body;

    // 检查角色是否存在
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json(ResponseUtil.error("角色不存在", 404));
    }

    // 更新角色基本信息
    role.name = name || role.name;
    role.description =
      description !== undefined ? description : role.description;
    await role.save();

    // 更新资源关联
    if (resourceIds !== undefined) {
      await role.setResources(resourceIds || []);
    }

    // 返回更新后的角色（包含关联的资源）
    const updatedRole = await Role.findByPk(id, {
      include: [{ model: Resource, as: "resources" }],
    });

    res.json(ResponseUtil.success(updatedRole, "角色更新成功"));
  } catch (err) {
    next(err);
  }
};

// 其他角色管理方法...
```

## 五、路由配置

### 1. 更新 api 路由

```javascript
// routes/api.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const resourceController = require("../controllers/resource.controller");
const roleController = require("../controllers/role.controller");
const { authJwt } = require("../middlewares");

// 认证相关路由
router.post("/auth/login", authController.login);
router.post("/auth/refresh", authController.refresh);
router.post("/auth/logout", authJwt.verifyToken, authController.logout);
router.get("/auth/info", authJwt.verifyToken, authController.getUserInfo);

// 资源管理路由
router.get(
  "/resources/tree",
  authJwt.verifyToken,
  resourceController.getResourceTree
);
router.post(
  "/resources",
  authJwt.verifyToken,
  resourceController.createResource
);
router.put(
  "/resources/:id",
  authJwt.verifyToken,
  resourceController.updateResource
);
router.delete(
  "/resources/:id",
  authJwt.verifyToken,
  resourceController.deleteResource
);

// 角色管理路由
router.get("/roles", authJwt.verifyToken, roleController.getRoles);
router.post("/roles", authJwt.verifyToken, roleController.createRole);
router.put("/roles/:id", authJwt.verifyToken, roleController.updateRole);
router.delete("/roles/:id", authJwt.verifyToken, roleController.deleteRole);

module.exports = router;
```

### 2. 创建权限中间件

```javascript
// middlewares/auth.middleware.js
const jwt = require("../utils/jwt");
const { User } = require("../models");
const permissionService = require("../services/permission.service");
const ResponseUtil = require("../utils/response");

// JWT验证中间件
exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json(ResponseUtil.error("未提供访问令牌", 401));
  }

  try {
    const decoded = jwt.verifyAccessToken(token);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json(ResponseUtil.error("访问令牌无效", 401));
  }
};

// 权限检查中间件
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const hasPermission = await permissionService.hasPermission(
        userId,
        permission
      );

      if (hasPermission) {
        next();
      } else {
        res.status(403).json(ResponseUtil.error("没有访问权限", 403));
      }
    } catch (error) {
      next(error);
    }
  };
};

// 多权限检查中间件（任一权限满足即可）
exports.hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const hasPermission = await permissionService.hasAnyPermission(
        userId,
        permissions
      );

      if (hasPermission) {
        next();
      } else {
        res.status(403).json(ResponseUtil.error("没有访问权限", 403));
      }
    } catch (error) {
      next(error);
    }
  };
};
```

# 不需要 migrations 移植模式

# 直接在项目启动的时候利用 seeders 初始化数据在项目开发初始应该更简单

## 一、使用 Seeders 进行项目初始化（无需 Migrations）

确实，在开发初期，尤其是针对快速迭代的项目，直接通过 seeders 初始化数据库会更加简便。以下是完整实现方案：

### 1. 配置 Sequelize Sync 模式

在项目启动文件（通常是 app.js 或 `server.js`）中添加自动同步数据库结构的代码：

```javascript
// app.js 或 server.js
const { sequelize } = require("./models");
const initializeData = require("./seeders/initialize");

// 启动函数
async function bootstrap() {
  try {
    // 同步数据库模型（force: true 会先删除表再创建，开发环境可用）
    // 生产环境建议使用 {force: false, alter: true}
    await sequelize.sync({ force: process.env.NODE_ENV === "development" });
    console.log("数据库同步成功");

    // 执行初始化脚本
    if (process.env.NODE_ENV === "development") {
      await initializeData();
      console.log("初始数据填充成功");
    }

    // 启动服务
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("启动失败:", error);
  }
}

bootstrap();
```

### 2. 创建统一的初始化脚本

```javascript
// seeders/initialize.js
const createResources = require("./resource-seeder");
const createRoles = require("./role-seeder");
const createUsers = require("./user-seeder");
const createResourceActions = require("./resource-action-seeder");
const associateRoleResources = require("./role-resource-seeder");

/**
 * 初始化所有数据
 * 注意执行顺序：先创建基础数据，再创建关联数据
 */
async function initializeData() {
  try {
    console.log("开始初始化数据...");

    // 1. 创建资源菜单
    await createResources();
    console.log("✓ 资源菜单数据初始化完成");

    // 2. 创建资源操作
    await createResourceActions();
    console.log("✓ 资源操作数据初始化完成");

    // 3. 创建角色
    await createRoles();
    console.log("✓ 角色数据初始化完成");

    // 4. 创建用户
    await createUsers();
    console.log("✓ 用户数据初始化完成");

    // 5. 创建角色资源关联
    await associateRoleResources();
    console.log("✓ 角色资源关联初始化完成");

    console.log("所有数据初始化完成!");
  } catch (error) {
    console.error("数据初始化失败:", error);
    throw error;
  }
}

module.exports = initializeData;
```

### 3. 实现各个 Seeder 脚本

例如，资源菜单 Seeder：

```javascript
// seeders/resource-seeder.js
const { Resource } = require("../models");
const resourcesData = require("./data/resources");

/**
 * 创建资源菜单
 */
async function createResources() {
  try {
    // 检查是否已存在数据
    const count = await Resource.count();
    if (count > 0) {
      console.log("资源菜单数据已存在，跳过初始化");
      return;
    }

    // 先创建顶级菜单
    const topMenus = resourcesData.filter((item) => !item.parentId);
    await Resource.bulkCreate(topMenus);

    // 查询所有创建的顶级菜单，获取真实ID
    const createdTopMenus = await Resource.findAll({
      where: { parentId: null },
    });

    // 创建子菜单，需要替换parentId
    for (const topMenu of createdTopMenus) {
      const childMenus = resourcesData.filter(
        (item) => item.parentId && item.parentCode === topMenu.code
      );

      // 替换parentId为真实ID
      const childrenToCreate = childMenus.map((child) => ({
        ...child,
        parentId: topMenu.id,
      }));

      if (childrenToCreate.length > 0) {
        await Resource.bulkCreate(childrenToCreate);
      }
    }

    console.log(`共创建${topMenus.length}个顶级菜单`);
  } catch (error) {
    console.error("创建资源菜单失败:", error);
    throw error;
  }
}

module.exports = createResources;
```

资源操作 Seeder：

```javascript
// seeders/resource-action-seeder.js
const { Resource, ResourceAction } = require("../models");
const actionData = require("./data/resource-actions");

/**
 * 创建资源操作
 */
async function createResourceActions() {
  try {
    // 检查是否已存在数据
    const count = await ResourceAction.count();
    if (count > 0) {
      console.log("资源操作数据已存在，跳过初始化");
      return;
    }

    // 获取所有资源
    const resources = await Resource.findAll();
    const resourceMap = {};

    // 构建资源代码到ID的映射
    resources.forEach((resource) => {
      resourceMap[resource.code] = resource.id;
    });

    // 为每个动作添加正确的resourceId
    const actionsToCreate = [];
    for (const action of actionData) {
      const resourceCode = action.resourceCode;
      if (resourceMap[resourceCode]) {
        actionsToCreate.push({
          name: action.name,
          code: action.code,
          resourceId: resourceMap[resourceCode],
          description: action.description,
          icon: action.icon,
          sort: action.sort,
          needConfirm: action.needConfirm || false,
          confirmMessage: action.confirmMessage,
        });
      }
    }

    await ResourceAction.bulkCreate(actionsToCreate);
    console.log(`共创建${actionsToCreate.length}个资源操作`);
  } catch (error) {
    console.error("创建资源操作失败:", error);
    throw error;
  }
}

module.exports = createResourceActions;
```

### 4. 准备数据文件

将固定的初始化数据放在单独的文件中：

```javascript
// seeders/data/resources.js
module.exports = [
  {
    name: "教学管理",
    code: "teachadmin",
    type: "menu",
    path: "teachadmin",
    parentId: null,
    parentCode: null,
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
    sort: 1,
  },
  {
    name: "全部学生列表",
    code: "teachadmin:allstudents",
    type: "menu",
    path: "allstudents",
    parentId: null, // 将在seeder中替换为真实ID
    parentCode: "teachadmin", // 用于关联父级
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
    sort: 1,
  },
  // 更多资源...
];
```

```javascript
// seeders/data/resource-actions.js
module.exports = [
  {
    name: "查看学生列表",
    code: "get",
    resourceCode: "teachadmin:allstudents",
    description: "查看全部学生列表",
    icon: null,
    sort: 1,
    needConfirm: false,
  },
  {
    name: "查询学生",
    code: "query",
    resourceCode: "teachadmin:allstudents",
    description: "搜索查询学生",
    icon: null,
    sort: 2,
    needConfirm: false,
  },
  // 更多操作...
];
```

### 5. 开发环境数据重置脚本

为了方便开发过程中重置数据，可以创建一个命令行脚本：

```javascript
// scripts/reset-db.js
const { sequelize } = require("../models");
const initializeData = require("../seeders/initialize");

async function resetDatabase() {
  try {
    console.log("开始重置数据库...");

    // 重新同步所有模型（删除并重建表）
    await sequelize.sync({ force: true });
    console.log("数据库表结构重置成功");

    // 重新初始化数据
    await initializeData();
    console.log("数据初始化成功");

    process.exit(0);
  } catch (error) {
    console.error("重置数据库失败:", error);
    process.exit(1);
  }
}

resetDatabase();
```

在 package.json 中添加命令：

```json
"scripts": {
  "reset-db": "node scripts/reset-db.js"
}
```

##
