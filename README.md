# CRM Server

基于 Node.js + Express + Sequelize + SQL Server 的 CRM 权限管理基础模块，支持 RBAC 权限模型、JWT 双 Token 认证、无限级分类。

## 技术栈

- Node.js
- Express
- Sequelize (ORM)
- SQL Server (MSSQL)
- JWT (jsonwebtoken)
- bcryptjs
- dotenv

## 目录结构

```
├── .env
├── .gitignore
├── package.json
├── app.js
├── config/
│   ├── database.js
│   └── auth.js
├── models/
│   ├── index.js
│   ├── user.model.js
│   ├── role.model.js
│   ├── permission.model.js
│   ├── category.model.js
│   ├── refreshToken.model.js
│   └── tokenBlacklist.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── category.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── category.routes.js
│   └── index.js
├── middlewares/
│   ├── auth.js
│   ├── rbac.js
│   └── errorHandler.js
├── services/
│   ├── auth.service.js
│   └── rbac.service.js
├── utils/
│   ├── jwt.js
│   └── response.js
├── seeders/
│   └── init.js
```

## 环境配置

1. 安装依赖：`npm install`
2. 配置 `.env` 文件，填写数据库和 JWT 密钥等信息：
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=1433
   DB_USER=sa
   DB_PASS=chinavane
   DB_NAME=crm
   JWT_SECRET=dev_jwt_secret
   JWT_REFRESH_SECRET=dev_refresh_secret
   ACCESS_TOKEN_EXPIRES_IN=1d
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```
3. 启动 SQL Server 并创建数据库

## 数据库初始化

### 方式一：自动初始化（推荐）

启动应用时会自动执行数据库同步和初始化：

```bash
npm start
```

### 方式二：手动初始化

如果需要单独执行数据库初始化，可以按以下步骤操作：

1. 安装 sequelize-cli（如果未安装）：

   ```bash
   npm install -g sequelize-cli
   ```

2. 创建数据库（如果不存在）：

   ```sql
   CREATE DATABASE crm;
   ```

3. 执行数据库迁移（创建表结构）：

   ```bash
   npx sequelize-cli db:migrate
   ```

4. 执行种子数据脚本（创建初始数据）：
   ```bash
   npx sequelize-cli db:seed:all
   ```

### 重置数据库

如果需要重置数据库，可以执行以下命令：

1. 回滚所有迁移：

   ```bash
   npx sequelize-cli db:migrate:undo:all
   ```

2. 重新执行迁移：

   ```bash
   npx sequelize-cli db:migrate
   ```

3. 重新执行种子数据脚本：
   ```bash
   npx sequelize-cli db:seed:all
   ```

## 启动方式

```bash
npm start
```

## 默认账户

- 管理员账号：admin
- 管理员密码：admin123

## API 文档

详细接口文档请见 docs 目录下各模块说明：

- docs/auth.md
- docs/user.md
- docs/category.md
- docs/role.md
- docs/resource.md

## 更新日志

详见 UPDATE.md

## 分类类型接口

#### 1. 创建分类类型

- **接口**：`POST /api/category-types`
- **描述**：创建新的分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "status": "boolean"
  }
  ```
- **响应**：分类类型对象

#### 2. 获取分类类型列表

- **接口**：`GET /api/category-types`
- **描述**：获取所有分类类型
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：分类类型数组

#### 3. 获取单个分类类型

- **接口**：`GET /api/category-types/:id`
- **描述**：获取指定分类类型详情
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：分类类型对象

#### 4. 更新分类类型

- **接口**：`PUT /api/category-types/:id`
- **描述**：更新指定分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建分类类型
- **响应**：分类类型对象

#### 5. 删除分类类型

- **接口**：`DELETE /api/category-types/:id`
- **描述**：删除指定分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果

## 分类接口

#### 1. 创建分类

- **接口**：`POST /api/categories`
- **描述**：创建新的分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string",
    "typeId": "number",
    "parentId": "number",
    "sort": "number",
    "description": "string"
  }
  ```
- **响应**：分类对象

#### 2. 获取分类列表

- **接口**：`GET /api/categories`
- **描述**：获取所有分类（需指定 typeId 查询参数）
- **认证**：需要有效的访问令牌（Bearer Token）
- **查询参数**：
  - `typeId`：分类类型 ID（必填）
- **示例**：
  ```
  GET /api/categories?typeId=1
  ```
- **响应**：分类数组
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "TypeId is required",
    "data": null
  }
  ```

#### 3. 获取单个分类

- **接口**：`GET /api/categories/:id`
- **描述**：获取指定分类详情
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：分类对象

#### 4. 获取分类树

- **接口**：`GET /api/categories/tree`
- **描述**：获取分类树结构（需指定 typeId 查询参数）
- **认证**：需要有效的访问令牌（Bearer Token）
- **查询参数**：
  - `typeId`：分类类型 ID（必填）
- **示例**：
  ```
  GET /api/categories/tree?typeId=1
  ```
- **响应**：分类树数组
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "TypeId is required",
    "data": null
  }
  ```

#### 5. 更新分类

- **接口**：`PUT /api/categories/:id`
- **描述**：更新指定分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建分类
- **响应**：分类对象

#### 6. 删除分类

- **接口**：`DELETE /api/categories/:id`
- **描述**：删除指定分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果

### 角色管理接口

#### 1. 创建角色

- **接口**：`POST /api/roles`
- **描述**：创建新角色（需要 manage_roles 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "description": "string",
    "permissionIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "角色创建成功",
    "data": {
      "id": "number",
      "name": "string",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "Permissions": [
        {
          "id": "number",
          "name": "string",
          "action": "string",
          "resource": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "角色名已存在",
    "data": null
  }
  ```

#### 2. 获取角色列表

- **接口**：`GET /api/roles`
- **描述**：获取角色列表（需要 view_roles 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `page`: 页码（默认：1）
  - `limit`: 每页数量（默认：10）
  - `search`: 搜索关键词
- **响应**：
  ```json
  {
    "code": 200,
    "message": "获取角色列表成功",
    "data": {
      "total": "number",
      "pages": "number",
      "currentPage": "number",
      "data": [
        {
          "id": "number",
          "name": "string",
          "description": "string",
          "createdAt": "string",
          "updatedAt": "string",
          "Permissions": [
            {
              "id": "number",
              "name": "string",
              "action": "string",
              "resource": "string"
            }
          ]
        }
      ]
    }
  }
  ```

#### 3. 获取单个角色

- **接口**：`GET /api/roles/:id`
- **描述**：获取指定角色信息（需要 view_roles 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "获取角色成功",
    "data": {
      "id": "number",
      "name": "string",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "Permissions": [
        {
          "id": "number",
          "name": "string",
          "action": "string",
          "resource": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 404,
    "message": "角色不存在",
    "data": null
  }
  ```

#### 4. 更新角色

- **接口**：`PUT /api/roles/:id`
- **描述**：更新指定角色信息（需要 manage_roles 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "description": "string",
    "permissionIds": "number[]"
  }
  ```
- **响应**：与获取单个角色接口相同
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "角色名已存在",
    "data": null
  }
  ```
  或
  ```json
  {
    "code": 404,
    "message": "角色不存在",
    "data": null
  }
  ```

#### 5. 删除角色

- **接口**：`DELETE /api/roles/:id`
- **描述**：删除指定角色（需要 manage_roles 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "角色删除成功",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "无法删除，该角色下存在用户",
    "data": null
  }
  ```
  或
  ```json
  {
    "code": 404,
    "message": "角色不存在",
    "data": null
  }
  ```

## RBAC 权限管理

### 权限检查流程

1. 用户登录后获取访问令牌（Access Token）
2. 访问需要权限的接口时，需要在请求头中携带访问令牌
3. 系统会自动检查用户是否具有所需权限：
   - 通过 Token 解析用户身份
   - 查询用户关联的角色
   - 检查角色是否具有所需权限
   - 如果没有权限，返回 403 错误

### 默认权限列表

| 权限名称          | 描述     | 所属角色    |
| ----------------- | -------- | ----------- |
| create_user       | 创建用户 | admin       |
| view_users        | 查看用户 | admin, user |
| update_user       | 更新用户 | admin       |
| delete_user       | 删除用户 | admin       |
| manage_roles      | 管理角色 | admin       |
| manage_categories | 管理分类 | admin       |

### 默认角色

1. **管理员(admin)**

   - 拥有所有权限
   - 可以管理用户、角色、权限和分类

2. **普通用户(user)**
   - 仅拥有查看权限
   - 可以查看用户列表和用户详情

## 接口响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    // 响应数据
  }
}
```

### 分页响应

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      // 数据列表
    ],
    "pagination": {
      "total": 100, // 总记录数
      "current": 1, // 当前页码
      "pageSize": 10, // 每页大小
      "totalPages": 10 // 总页数
    }
  }
}
```

### 错误响应

```json
{
  "code": 400, // 错误码
  "message": "错误信息", // 错误描述
  "data": null
}
```

### 常见错误码

- 200: 成功
- 400: 请求参数错误
- 401: 未认证或认证失败
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 资源管理接口

#### 1. 创建资源

- **接口**：`POST /api/resources`
- **描述**：创建新资源（需要 manage_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "name": "string",
    "type": "string", // menu/page/button
    "code": "string",
    "path": "string",
    "parentId": "number",
    "component": "string",
    "icon": "string",
    "sort": "number",
    "hidden": "boolean",
    "redirect": "string",
    "alwaysShow": "boolean",
    "meta": {
      "title": "string",
      "icon": "string",
      "noCache": false,
      "link": null
    },
    "description": "string"
  }
  ```
- **响应**：资源对象

#### 2. 获取资源列表

- **接口**：`GET /api/resources`
- **描述**：获取所有资源（需要 view_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源数组

#### 3. 获取单个资源

- **接口**：`GET /api/resources/:id`
- **描述**：获取指定资源详情（需要 view_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源对象

#### 4. 更新资源

- **接口**：`PUT /api/resources/:id`
- **描述**：更新指定资源（需要 manage_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建资源
- **响应**：资源对象

#### 5. 删除资源

- **接口**：`DELETE /api/resources/:id`
- **描述**：删除指定资源（需要 manage_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果

## 资源操作管理接口

#### 1. 创建资源操作

- **接口**：`POST /api/resource-actions`
- **描述**：创建新资源操作（需要 manage_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "icon": "string",
    "sort": "number",
    "needConfirm": "boolean",
    "confirmMessage": "string"
  }
  ```
- **响应**：资源操作对象

#### 2. 获取资源操作列表

- **接口**：`GET /api/resource-actions`
- **描述**：获取所有资源操作（需要 view_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源操作数组

#### 3. 获取单个资源操作

- **接口**：`GET /api/resource-actions/:id`
- **描述**：获取指定资源操作详情（需要 view_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源操作对象

#### 4. 更新资源操作

- **接口**：`PUT /api/resource-actions/:id`
- **描述**：更新指定资源操作（需要 manage_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建资源操作
- **响应**：资源操作对象

#### 5. 删除资源操作

- **接口**：`DELETE /api/resource-actions/:id`
- **描述**：删除指定资源操作（需要 manage_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果

## 权限列表（按实际接口操作补全）

| 权限名称                | 描述          |
| ----------------------- | ------------- |
| create_user             | 创建用户      |
| view_users              | 查看用户      |
| update_user             | 更新用户      |
| delete_user             | 删除用户      |
| manage_roles            | 管理角色      |
| view_roles              | 查看角色      |
| manage_categories       | 管理分类      |
| view_categories         | 查看分类      |
| manage_resources        | 管理资源      |
| view_resources          | 查看资源      |
| manage_resource_actions | 管理资源操作  |
| view_resource_actions   | 查看资源操作  |
| ...                     | ...（可扩展） |

npx sequelize-cli db:seed:all
