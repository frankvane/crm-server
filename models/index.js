const { Sequelize } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(config);

// 导入模型定义
const User = require("./user.model")(sequelize);
const Role = require("./role.model")(sequelize);
const Permission = require("./permission.model")(sequelize);
const Resource = require("./resource.model")(sequelize);
const ResourceAction = require("./resourceAction.model")(sequelize);
const RoleResource = require("./roleResource.model")(sequelize);
const RefreshToken = require("./refreshToken.model")(sequelize);

// 建立模型关联
// 1. User 相关关联
User.belongsToMany(Role, {
  through: "UserRoles",
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
});

// 2. Role 相关关联
Role.belongsToMany(User, {
  through: "UserRoles",
  foreignKey: "roleId",
  otherKey: "userId",
  as: "users",
});

Role.belongsToMany(Permission, {
  through: "RolePermissions",
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
});

Role.belongsToMany(Resource, {
  through: "RoleResources",
  foreignKey: "roleId",
  otherKey: "resourceId",
  as: "resources",
});

// 3. Permission 相关关联
Permission.belongsToMany(Role, {
  through: "RolePermissions",
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "roles",
});

// 4. Resource 相关关联
Resource.belongsToMany(Role, {
  through: "RoleResources",
  foreignKey: "resourceId",
  otherKey: "roleId",
  as: "roles",
});

Resource.belongsTo(Resource, {
  foreignKey: "parentId",
  as: "parent",
});

Resource.hasMany(Resource, {
  foreignKey: "parentId",
  as: "children",
});

Resource.hasMany(ResourceAction, {
  foreignKey: "resourceId",
  as: "actions",
});

// 5. ResourceAction 相关关联
ResourceAction.belongsTo(Resource, {
  foreignKey: "resourceId",
  as: "resource",
});

// 6. RefreshToken 相关关联
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  Resource,
  ResourceAction,
  RoleResource,
  RefreshToken,
};
