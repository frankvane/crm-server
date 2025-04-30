# 用户管理接口文档

## 1. 创建用户

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
    "Roles": [ ... ]
  }
  ```
- **错误**：
  - 400: "Username already exists"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

## 2. 获取用户列表

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
    "data": [ ... ]
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

## 3. 获取单个用户

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
    "Roles": [ ... ]
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

## 4. 更新用户

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

## 5. 删除用户

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
