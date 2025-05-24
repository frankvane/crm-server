# 角色管理接口文档

## 1. 创建角色

- **接口**：`POST /api/roles`
- **描述**：创建新角色（需要 system:role:add 权限）
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
    "permissionIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Role created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "status": "number",
      "permissions": [
        {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role name already exists",
    "data": null
  }
  ```

## 2. 获取所有角色

- **接口**：`GET /api/roles/all`
- **描述**：获取所有角色（不分页）（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：

  - `status`: 角色状态（1: 启用, 0: 禁用）

- **查询示例**：

  ```
  # 获取所有角色
  GET /api/roles/all

  # 获取所有启用的角色
  GET /api/roles/all?status=1
  ```

- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": [
      {
        "id": "number",
        "name": "string",
        "code": "string",
        "description": "string",
        "status": "number",
        "permissions": [
          {
            "id": "number",
            "name": "string",
            "code": "string"
          }
        ]
      }
    ]
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Internal Server Error",
    "data": null
  }
  ```

## 3. 获取角色列表

- **接口**：`GET /api/roles`
- **描述**：获取角色列表（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：

  - `page`: 页码（默认：1）
  - `pageSize`: 每页数量（默认：10）
  - `search`: 搜索关键词（支持角色名称、编码、描述的模糊查询）
  - `name`: 角色名称（支持模糊查询）
  - `code`: 角色编码（支持模糊查询）
  - `status`: 角色状态（1: 启用, 0: 禁用）

- **查询示例**：

  ```
  # 全字段搜索
  GET /api/roles?search=管理员

  # 指定字段搜索
  GET /api/roles?name=系统&code=SYSTEM

  # 状态筛选
  GET /api/roles?status=1

  # 组合查询
  GET /api/roles?name=管理员&status=1&page=1&pageSize=10
  ```

- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "list": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "description": "string",
          "status": "number",
          "permissions": [
            {
              "id": "number",
              "name": "string",
              "code": "string"
            }
          ]
        }
      ],
      "pagination": {
        "current": "number",
        "pageSize": "number",
        "total": "number"
      }
    }
  }
  ```

## 4. 获取单个角色

- **接口**：`GET /api/roles/:id`
- **描述**：获取指定角色信息（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "status": "number",
      "permissions": [
        {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      ],
      "resources": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "type": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 5. 更新角色

- **接口**：`PUT /api/roles/:id`
- **描述**：更新指定角色信息（需要 system:role:edit 权限）
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
    "status": "number",
    "permissionIds": "number[]"
  }
  ```
- **响应**：与获取单个角色接口相同
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role name already exists",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 6. 删除角色

- **接口**：`DELETE /api/roles/:id`
- **描述**：删除指定角色（需要 system:role:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Role deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Cannot delete role with associated users",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 7. 切换角色状态

- **接口**：`PUT /api/roles/:id/toggle-status`
- **描述**：启用或禁用指定角色（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Role enabled/disabled successfully",
    "data": {
      "id": "number",
      "status": "number"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 8. 分配资源

- **接口**：`POST /api/roles/:roleId/resources`
- **描述**：为指定角色分配资源（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "resourceIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resources assigned successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "status": "number",
      "resources": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "type": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 9. 分配权限

- **接口**：`POST /api/roles/:roleId/permissions`
- **描述**：为指定角色分配权限（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "permissionIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Permissions assigned successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "status": "number",
      "permissions": [
        {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```
