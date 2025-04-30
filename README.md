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

## API 接口文档

### 认证接口

#### 1. 用户登录

- **接口**：`POST /api/auth/login`
- **描述**：用户登录，返回访问令牌和刷新令牌
- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "status": "boolean",
        "roles": [
          {
            "id": "number",
            "name": "string",
            "description": "string",
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
      },
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 401,
    "message": "User not found" | "Invalid password",
    "data": null
  }
  ```

#### 2. 刷新令牌

- **接口**：`POST /api/auth/refresh`
- **描述**：使用刷新令牌获取新的访问令牌
- **请求体**：
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 401,
    "message": "No refresh token provided" | "Invalid refresh token",
    "data": null
  }
  ```

#### 3. 注销登录

- **接口**：`POST /api/auth/logout`
- **描述**：注销用户并使刷新令牌失效
- **请求体**：
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Logged out successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 401,
    "message": "No refresh token provided",
    "data": null
  }
  ```

### 用户管理接口

#### 1. 创建用户

- **接口**：`POST /api/users`
- **描述**：创建新用户（需要 create_user 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "roleIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "status": "boolean",
    "createdAt": "string",
    "updatedAt": "string",
    "Roles": [
      {
        "id": "number",
        "name": "string",
        "description": "string"
      }
    ]
  }
  ```
- **错误**：
  - 400: "Username already exists"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

#### 2. 获取用户列表

- **接口**：`GET /api/users`
- **描述**：获取用户列表（需要 view_users 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - page: 页码（默认：1）
  - limit: 每页数量（默认：10）
  - search: 搜索关键词
- **响应**：
  ```json
  {
    "total": "number",
    "pages": "number",
    "currentPage": "number",
    "data": [
      {
        "id": "number",
        "username": "string",
        "email": "string",
        "status": "boolean",
        "createdAt": "string",
        "updatedAt": "string",
        "Roles": [
          {
            "id": "number",
            "name": "string",
            "description": "string"
          }
        ]
      }
    ]
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

#### 3. 获取单个用户

- **接口**：`GET /api/users/:id`
- **描述**：获取指定用户信息（需要 view_users 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "status": "boolean",
    "createdAt": "string",
    "updatedAt": "string",
    "Roles": [
      {
        "id": "number",
        "name": "string",
        "description": "string"
      }
    ]
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

#### 4. 更新用户

- **接口**：`PUT /api/users/:id`
- **描述**：更新指定用户信息（需要 update_user 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "status": "boolean",
    "roleIds": "number[]"
  }
  ```
- **响应**：与获取单个用户接口相同
- **错误**：
  - 400: "Username already exists"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

#### 5. 删除用户

- **接口**：`DELETE /api/users/:id`
- **描述**：删除指定用户（需要 delete_user 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

### 分类类型接口

#### 1. 创建分类类型

- **接口**：`POST /api/category-types`
- **描述**：创建新的分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "status": "boolean"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Category type created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "status": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "Category type code already exists",
    "data": null
  }
  ```

#### 2. 获取分类类型列表

- **接口**：`GET /api/category-types`
- **描述**：获取所有分类类型
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `page`: 页码（默认：1）
  - `pageSize`: 每页数量（默认：10）
  - `status`: 状态过滤（可选，true/false）
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "total": "number",
      "items": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "description": "string",
          "status": "boolean",
          "createdAt": "string",
          "updatedAt": "string"
        }
      ],
      "currentPage": "number",
      "pageSize": "number",
      "totalPages": "number"
    }
  }
  ```

#### 3. 获取单个分类类型

- **接口**：`GET /api/category-types/:id`
- **描述**：获取指定分类类型的详细信息
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "status": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 404,
    "message": "Category type not found",
    "data": null
  }
  ```

#### 4. 更新分类类型

- **接口**：`PUT /api/category-types/:id`
- **描述**：更新指定分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "status": "boolean"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Category type updated successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "status": "boolean",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "Category type code already exists",
    "data": null
  }
  ```
  或
  ```json
  {
    "code": 404,
    "message": "Category type not found",
    "data": null
  }
  ```

#### 5. 删除分类类型

- **接口**：`DELETE /api/category-types/:id`
- **描述**：删除指定分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Category type deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "Cannot delete category type with associated categories",
    "data": null
  }
  ```
  或
  ```json
  {
    "code": 404,
    "message": "Category type not found",
    "data": null
  }
  ```

### 分类接口

#### 1. 创建分类

- **接口**：`POST /api/categories`
- **描述**：创建新的分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
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
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Category created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "typeId": "number",
      "parentId": "number",
      "sort": "number",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "Category code already exists under the same type",
    "data": null
  }
  ```

#### 2. 获取分类树

- **接口**：`GET /api/categories/tree?typeId={typeId}`
- **描述**：获取指定类型的分类树结构
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求参数**：
  - `typeId`: 分类类型 ID（必填，需要在 URL 中指定）
- **示例请求**：
  ```
  GET /api/categories/tree?typeId=1
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "id": "number",
        "name": "string",
        "code": "string",
        "typeId": "number",
        "sort": "number",
        "description": "string",
        "children": [
          {
            "id": "number",
            "name": "string",
            "code": "string",
            "typeId": "number",
            "parentId": "number",
            "sort": "number",
            "description": "string"
          }
        ]
      }
    ]
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "TypeId is required",
    "data": null
  }
  ```

#### 3. 更新分类

- **接口**：`PUT /api/categories/:id`
- **描述**：更新指定分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string",
    "parentId": "number",
    "sort": "number",
    "description": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Category updated successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "typeId": "number",
      "parentId": "number",
      "sort": "number",
      "description": "string",
      "updatedAt": "string"
    }
  }
  ```

#### 4. 删除分类

- **接口**：`DELETE /api/categories/:id`
- **描述**：删除指定分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Category deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "code": 400,
    "message": "Cannot delete category with children",
    "data": null
  }
  ```

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

## 更新日志（Changelog）

所有显著更改都将记录在此文件中。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

### [v1.1.0] - 2024-03-20

#### 新增

- **分类管理模块**
  - 分类类型的增删改查功能
  - 无限级分类结构的实现
  - 分类树形结构的查询接口
  - 分类代码唯一性校验机制

#### 优化

- **数据库配置**
  - 优化 SQL Server 连接参数配置
  - 添加数据库连接重试机制
  - 设置连接超时处理
  - 完善数据库错误处理

#### 文档

- 新增分类管理模块的 API 文档
- 添加数据库初始化和重置指南
- 完善环境配置说明文档

### [v1.0.0] - 2024-03-19

#### 新增

- **RBAC 权限管理**
  - 用户管理的完整 CRUD 接口
  - 角色管理的完整 CRUD 接口
  - 权限管理和权限检查机制
  - 用户-角色-权限关联管理
- **JWT 认证系统**
  - 实现双 Token 认证机制
  - Access Token 的签发与验证
  - Refresh Token 的管理
  - Token 黑名单功能

#### 优化

- **数据库功能**
  - 完成所有数据模型设计
  - 实现数据库自动同步机制
  - 添加初始化数据脚本
  - 优化数据查询性能

#### 文档

- 编写详细的 API 接口文档
- 添加 RBAC 权限管理说明
- 完善项目目录结构说明

### [v0.2.0] - 2024-03-18

#### 新增

- **项目框架**
  - 集成 Express.js 框架
  - 配置 Sequelize ORM
  - 添加必要的中间件
  - 设置基础路由结构

#### 优化

- **开发环境**
  - 配置 ESLint 和 Prettier
  - 设置 Git 提交规范
  - 添加开发调试配置
  - 优化项目结构

#### 文档

- 添加开发环境配置说明
- 编写代码规范文档
- 更新项目依赖说明

### [v0.1.0] - 2024-03-17

#### 初始化

- 创建基础项目结构
- 初始化 package.json
- 添加核心依赖包
- 配置基本开发环境
- 初始化 Git 仓库

#### 文档

- 创建基础 README 文件
- 添加项目描述
- 添加安装说明

[v1.1.0]: https://github.com/your-username/crm-server/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/your-username/crm-server/compare/v0.2.0...v1.0.0
[v0.2.0]: https://github.com/your-username/crm-server/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/your-username/crm-server/releases/tag/v0.1.0

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
