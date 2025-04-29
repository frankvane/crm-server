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
2. 配置 `.env` 文件，填写数据库和 JWT 密钥等信息
3. 启动 SQL Server 并创建数据库

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

### v1.0.1 (2024-03-19)

- 添加用户管理模块（CRUD 接口）
- 实现数据库初始化脚本
- 添加默认管理员账户
- 完善接口文档

### v1.0.2 (2024-03-19)

- 优化 RBAC 权限管理模块
- 修复数据库同步问题
- 完善权限检查机制
- 更新文档，添加 RBAC 权限管理说明

### v1.0.3 (2024-03-19)

- 统一接口响应格式
- 添加分页响应格式
- 完善错误处理机制
- 更新接口文档

### v1.0.0

- 项目初始化，完成 RBAC 权限管理、JWT 双 Token 认证、无限级分类基础模块
- 支持用户、角色、权限、分类、Token 等基础模型
- 实现基础认证、分类接口
- 添加详细的 API 接口文档

### v0.2.0 (2024-03-xx)

- 新增分类管理功能
  - 支持分类类型管理
  - 支持无限级分类
  - 分类代码唯一性校验
  - 分类树形结构查询
- 完善 API 文档
  - 新增分类管理接口文档
  - 更新用户管理接口文档

### v0.1.0 (2024-03-xx)

- 初始版本
  - 基础 RBAC 权限模型
  - JWT 双 Token 认证
  - 用户管理功能
  - 角色权限管理
