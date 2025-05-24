# 命名规范

> **注意**: 本文档中的模型关联别名命名规范已迁移到更详细的文档中。请参阅 [模型关联别名命名规范](./standards/model-alias-conventions.md)。

## 权限命名规范

在整个系统中，权限命名应遵循以下规范：

### 1. 权限代码格式

- **资源操作权限**: `{resource-code}:{action-code}`
  - 示例: `system:user:add`, `category:type:view`

### 2. 资源代码规则

- 使用小写字母
- 使用英文冒号(`:`)作为分隔符
- 示例: `system`, `system:user`, `category:type`

### 3. 操作代码规则

- 标准操作: `add`, `edit`, `delete`, `view`
- 其他特殊操作: `export`, `assign` 等
- 示例: `system:user:add`, `system:role:assign`

### 4. 权限与路由对应

- API 路由中使用的权限名称必须与数据库中存储的权限名称完全一致
- 登录返回的 JWT 令牌中包含的权限名称格式也应与此一致

### 5. 当前使用的权限列表

#### 系统管理

- `system:user:add` - 添加用户
- `system:user:edit` - 编辑用户
- `system:user:delete` - 删除用户
- `system:user:export` - 导出用户

- `system:role:add` - 添加角色
- `system:role:edit` - 编辑角色
- `system:role:delete` - 删除角色
- `system:role:assign` - 分配角色权限

- `system:resource:add` - 添加资源
- `system:resource:edit` - 编辑资源
- `system:resource:delete` - 删除资源

#### 分类管理

- `category:type:add` - 添加分类类型
- `category:type:edit` - 编辑分类类型
- `category:type:delete` - 删除分类类型
- `category:type:view` - 查看分类类型

- `category:category:add` - 添加分类
- `category:category:edit` - 编辑分类
- `category:category:delete` - 删除分类
- `category:category:view` - 查看分类

## 接口返回格式规范

- 所有后端接口必须返回如下结构：
  ```json
  {
    "code": 200,
    "message": "ok",
    "data": {}
  }
  ```
- 错误时 `code` 为非 200，`message` 需明确，`data` 保持对象类型。

## API 文档编写规范

- 每个接口文档需包含以下内容：
  - 接口路径与方法
  - 权限要求
  - 请求参数（含类型、是否必填、说明）
  - 响应结构（含字段说明）
  - 错误码与含义
  - 请求/响应示例

## 接口文档与代码同步要求

- 每次接口变更，需同步更新 API 文档，确保文档与实现一致。
- 文档更新需记录在 `UPDATE.md`，并注明日期与内容。
