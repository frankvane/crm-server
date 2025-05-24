# 模型关联别名命名规范（细化版）

## 核心原则

1. **一致性**: 所有模型中的关联别名必须统一，不允许混用大小写或复数形式
2. **清晰性**: 别名应清晰表达模型之间的关系
3. **可维护性**: 遵循共同约定，便于团队协作和代码维护

## 关联类型与命名规则

### 1. 多对多关联 (Many-to-Many)

- **命名规则**: 使用小写复数形式
- **格式**: `模型名称的复数小写形式`
- **示例**:
  - `User -> Role`: "roles"
  - `Role -> Permission`: "permissions"
  - `Role -> Resource`: "resources"
  - `Resource -> Role`: "roles"
  - `Permission -> Role`: "roles"
  - `User -> Category`: "categories"（如有用户-分类收藏/关注等场景）

### 2. 一对多关联 (One-to-Many)

- **命名规则**: 使用小写复数形式表示"多"的一方
- **格式**: `模型名称的复数小写形式`
- **示例**:
  - `Resource -> ResourceAction`: "actions"
  - `Resource -> Permission`: "permissions"
  - `Resource -> Resource` (自引用): "children"
  - `User -> RefreshToken`: "refreshTokens"
  - `CategoryType -> Category`: "categories"
  - `File -> FileChunk`: "chunks"

### 3. 多对一关联 (Many-to-One) 或一对一关联 (One-to-One)

- **命名规则**: 使用小写单数形式
- **格式**: `模型名称的单数小写形式`
- **示例**:
  - `Permission -> Resource`: "resource"
  - `Permission -> ResourceAction`: "action"
  - `ResourceAction -> Resource`: "resource"
  - `ResourceAction -> Permission`: "permission"
  - `Resource -> Resource` (自引用): "parent"
  - `Category -> Category` (自引用): "parent"
  - `Category -> CategoryType`: "type"
  - `FileChunk -> File`: "file"

## 大文件分片相关模型别名

- `File` 一对多 `FileChunk`：`File.hasMany(FileChunk, { as: "chunks" })`
- `FileChunk` 多对一 `File`：`FileChunk.belongsTo(File, { as: "file" })`

## 分类相关模型别名

- `CategoryType` 一对多 `Category`：`CategoryType.hasMany(Category, { as: "categories" })`
- `Category` 多对一 `CategoryType`：`Category.belongsTo(CategoryType, { as: "type" })`
- `Category` 自引用一对多：`Category.hasMany(Category, { as: "children", foreignKey: "parentId" })`
- `Category` 自引用多对一：`Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" })`

## 资源与权限相关模型别名

- `Resource` 一对多 `ResourceAction`：`Resource.hasMany(ResourceAction, { as: "actions" })`
- `ResourceAction` 多对一 `Resource`：`ResourceAction.belongsTo(Resource, { as: "resource" })`
- `Resource` 一对多 `Permission`：`Resource.hasMany(Permission, { as: "permissions" })`
- `Permission` 多对一 `Resource`：`Permission.belongsTo(Resource, { as: "resource" })`
- `ResourceAction` 一对一 `Permission`：`ResourceAction.hasOne(Permission, { as: "permission" })`
- `Permission` 多对一 `ResourceAction`：`Permission.belongsTo(ResourceAction, { as: "action" })`

## 用户、角色、权限相关模型别名

- `User` 多对多 `Role`：`User.belongsToMany(Role, { as: "roles", ... })`
- `Role` 多对多 `User`：`Role.belongsToMany(User, { as: "users", ... })`
- `Role` 多对多 `Permission`：`Role.belongsToMany(Permission, { as: "permissions", ... })`
- `Permission` 多对多 `Role`：`Permission.belongsToMany(Role, { as: "roles", ... })`
- `Role` 多对多 `Resource`：`Role.belongsToMany(Resource, { as: "resources", ... })`
- `Resource` 多对多 `Role`：`Resource.belongsToMany(Role, { as: "roles", ... })`
- `User` 一对多 `RefreshToken`：`User.hasMany(RefreshToken, { as: "refreshTokens" })`

## 表结构字段示例

```js
// FileChunk
{
  id: INTEGER,
  file_id: STRING, // 外键，关联File
  chunk_index: INTEGER,
  ...
}

// Category
{
  id: INTEGER,
  typeId: INTEGER, // 外键，关联CategoryType
  parentId: INTEGER, // 外键，自引用
  ...
}
```

## Sequelize 定义示例

```js
// File与FileChunk
File.hasMany(models.FileChunk, { as: "chunks", foreignKey: "file_id" });
FileChunk.belongsTo(models.File, { as: "file", foreignKey: "file_id" });

// CategoryType与Category
CategoryType.hasMany(models.Category, {
  as: "categories",
  foreignKey: "typeId",
});
Category.belongsTo(models.CategoryType, { as: "type", foreignKey: "typeId" });
Category.hasMany(models.Category, { as: "children", foreignKey: "parentId" });
Category.belongsTo(models.Category, { as: "parent", foreignKey: "parentId" });

// User与Role
User.belongsToMany(models.Role, {
  through: "UserRoles",
  as: "roles",
  foreignKey: "userId",
  otherKey: "roleId",
});
Role.belongsToMany(models.User, {
  through: "UserRoles",
  as: "users",
  foreignKey: "roleId",
  otherKey: "userId",
});

// Role与Permission
Role.belongsToMany(models.Permission, {
  through: "RolePermissions",
  as: "permissions",
  foreignKey: "roleId",
  otherKey: "permissionId",
});
Permission.belongsToMany(models.Role, {
  through: "RolePermissions",
  as: "roles",
  foreignKey: "permissionId",
  otherKey: "roleId",
});

// Role与Resource
Role.belongsToMany(models.Resource, {
  through: "RoleResources",
  as: "resources",
  foreignKey: "roleId",
  otherKey: "resourceId",
});
Resource.belongsToMany(models.Role, {
  through: "RoleResources",
  as: "roles",
  foreignKey: "resourceId",
  otherKey: "roleId",
});

// Resource与ResourceAction
Resource.hasMany(models.ResourceAction, {
  as: "actions",
  foreignKey: "resourceId",
});
ResourceAction.belongsTo(models.Resource, {
  as: "resource",
  foreignKey: "resourceId",
});

// Resource与Permission
Resource.hasMany(models.Permission, {
  as: "permissions",
  foreignKey: "resourceId",
});
Permission.belongsTo(models.Resource, {
  as: "resource",
  foreignKey: "resourceId",
});

// ResourceAction与Permission
ResourceAction.hasOne(models.Permission, {
  as: "permission",
  foreignKey: "actionId",
});
Permission.belongsTo(models.ResourceAction, {
  as: "action",
  foreignKey: "actionId",
});

// User与RefreshToken
User.hasMany(models.RefreshToken, {
  as: "refreshTokens",
  foreignKey: "userId",
});
RefreshToken.belongsTo(models.User, { as: "user", foreignKey: "userId" });
```

## 常见错误场景

- **错误：别名大小写不一致**
  - 错误：`as: "Roles"` 或 `as: "Permission"`
  - 正确：`as: "roles"`、`as: "permissions"`
- **错误：多对多用单数**
  - 错误：`as: "role"`（多对多）
  - 正确：`as: "roles"`
- **错误：一对多用单数**
  - 错误：`as: "category"`（一对多）
  - 正确：`as: "categories"`

## 团队协作建议

1. 代码评审时重点关注关联别名命名，发现不一致及时修正。
2. 新增模型或关联时，先查阅本规范，确保命名统一。
3. 建议在 ESLint/TSLint 中自定义规则，自动检测常见命名错误。
4. 文档和代码注释中都应明确标注别名，便于新成员快速理解。

## 模型架构总览（与当前 models 目录一致）

| 模型           | 关联到              | 关联类型 | 标准别名        |
| -------------- | ------------------- | -------- | --------------- |
| User           | Role                | 多对多   | "roles"         |
| User           | RefreshToken        | 一对多   | "refreshTokens" |
| Role           | User                | 多对多   | "users"         |
| Role           | Permission          | 多对多   | "permissions"   |
| Role           | Resource            | 多对多   | "resources"     |
| Permission     | Role                | 多对多   | "roles"         |
| Permission     | Resource            | 多对一   | "resource"      |
| Permission     | ResourceAction      | 多对一   | "action"        |
| Resource       | Resource (parent)   | 多对一   | "parent"        |
| Resource       | Resource (children) | 一对多   | "children"      |
| Resource       | Role                | 多对多   | "roles"         |
| Resource       | Permission          | 一对多   | "permissions"   |
| Resource       | ResourceAction      | 一对多   | "actions"       |
| ResourceAction | Resource            | 多对一   | "resource"      |
| ResourceAction | Permission          | 一对一   | "permission"    |
| CategoryType   | Category            | 一对多   | "categories"    |
| Category       | Category (parent)   | 多对一   | "parent"        |
| Category       | Category (children) | 一对多   | "children"      |
| Category       | CategoryType        | 多对一   | "type"          |
| File           | FileChunk           | 一对多   | "chunks"        |
| FileChunk      | File                | 多对一   | "file"          |

---

如有新增业务模型，请在此文档补充对应的别名规范。
