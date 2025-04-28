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
    "accessToken": "string",
    "refreshToken": "string"
  }
  ```
- **错误**：
  - 401: "User not found" / "Invalid password"
  - 500: "Internal Server Error"

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
    "accessToken": "string"
  }
  ```
- **错误**：
  - 401: "No refresh token" / "Invalid refresh token"
  - 500: "Internal Server Error"

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
    "message": "Logged out"
  }
  ```
- **错误**：
  - 401: "No refresh token"
  - 500: "Internal Server Error"

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

### 分类接口

#### 1. 创建分类

- **接口**：`POST /api/category`
- **描述**：创建新的分类（支持无限级嵌套）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "parentId": "number | null",
    "description": "string | null"
  }
  ```
- **响应**：返回创建的分类对象
  ```json
  {
    "id": "number",
    "name": "string",
    "parentId": "number | null",
    "description": "string | null",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 500: "Internal Server Error"

#### 2. 获取分类树

- **接口**：`GET /api/category`
- **描述**：获取完整的分类树结构
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：返回树形结构的分类列表
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "parentId": null,
      "description": "string",
      "children": [
        {
          "id": "number",
          "name": "string",
          "parentId": "number",
          "description": "string",
          "children": []
        }
      ]
    }
  ]
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 500: "Internal Server Error"

## 更新日志（Changelog）

### v1.0.1 (2024-03-19)

- 添加用户管理模块（CRUD 接口）
- 实现数据库初始化脚本
- 添加默认管理员账户
- 完善接口文档

### v1.0.0

- 项目初始化，完成 RBAC 权限管理、JWT 双 Token 认证、无限级分类基础模块
- 支持用户、角色、权限、分类、Token 等基础模型
- 实现基础认证、分类接口
- 添加详细的 API 接口文档
