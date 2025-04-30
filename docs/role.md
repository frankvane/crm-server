# 角色管理接口文档

## 1. 创建角色

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
    "data": { ... }
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

## 2. 获取角色列表

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
    "data": { ... }
  }
  ```

## 3. 获取单个角色

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
    "data": { ... }
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

## 4. 更新角色

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

## 5. 删除角色

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
