# 资源管理接口文档

## 1. 创建资源

- **接口**：`POST /api/resources`
- **描述**：创建新资源（需要 system:resource:add 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "type": "string", // menu/page/button
    "code": "string", // 资源唯一标识，建议格式 system:user
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
      "noCache": "boolean",
      "link": "string|null"
    },
    "description": "string"
  }
  ```
- **meta 字段说明**：

  - 在请求中，meta 可以直接传递为对象，系统会自动将其序列化为 JSON 字符串
  - 在响应中，meta 会自动被解析为 JSON 对象返回
  - meta 主要用于存储与前端路由相关的配置信息
  - 字段必须是有效的 JSON 结构

- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "type": "string",
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
        "noCache": "boolean",
        "link": "string|null"
      },
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource code already exists",
    "data": null
  }
  ```

## 2. 获取资源列表

- **接口**：`GET /api/resources`
- **描述**：获取所有资源（需要 system:resource:edit 权限）
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
    "data": [
      {
        "id": "number",
        "name": "string",
        "type": "string",
        "code": "string",
        "path": "string",
        "parentId": "number",
        "component": "string",
        "icon": "string",
        "meta": {
          "title": "string",
          "icon": "string",
          "noCache": "boolean",
          "link": "string|null"
        },
        "children": [],
        "actions": [
          {
            "id": "number",
            "name": "string",
            "code": "string", // 资源操作唯一标识，格式为 resourceCode:actionCode
            "description": "string"
          }
        ]
      }
    ]
  }
  ```

## 3. 获取单个资源

- **接口**：`GET /api/resources/:id`
- **描述**：获取指定资源详情（需要 system:resource:edit 权限）
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
      "type": "string",
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
        "noCache": "boolean",
        "link": "string|null"
      },
      "description": "string",
      "actions": [
        {
          "id": "number",
          "name": "string",
          "code": "string", // 资源操作唯一标识，格式为 resourceCode:actionCode
          "description": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```

## 4. 更新资源

- **接口**：`PUT /api/resources/:id`
- **描述**：更新指定资源（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建资源
- **响应**：同获取单个资源
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Resource code already exists",
    "data": null
  }
  ```

## 5. 删除资源

- **接口**：`DELETE /api/resources/:id`
- **描述**：删除指定资源（需要 system:resource:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete resource with child resources",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete resource with actions, please delete all actions first.",
    "data": null
  }
  ```
- **级联删除说明**：
  删除资源时，系统会自动删除该资源下的所有资源操作（actions）及其关联的权限（permissions）。如有子资源，需先删除所有子资源。

## 6. 资源操作（嵌套路由）

### 6.1 创建资源操作

- **接口**：`POST /api/resources/:resourceId/actions`
- **描述**：为指定资源创建操作（需要 system:resource:add 权限）
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string", // 操作标识，如 add、edit、delete 或完整格式 system:user:add
    "description": "string",
    "icon": "string",
    "sort": "number",
    "needConfirm": "boolean",
    "confirmMessage": "string"
  }
  ```
- **code 字段说明**：
  - 支持传递单词（如 add）或完整格式（如 system:user:add），后端会自动拼接为 resourceCode:actionCode。
  - 最终 code 字段始终为 resourceCode:actionCode。
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource action created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string", // resourceCode:actionCode
      "description": "string",
      "icon": "string",
      "sort": "number",
      "needConfirm": "boolean",
      "confirmMessage": "string",
      "resourceId": "number",
      "permission": {
        "id": "number",
        "name": "string",
        "code": "string",
        "description": "string"
      }
    }
  }
  ```

### 6.2 获取资源操作列表

- **接口**：`GET /api/resources/:resourceId/actions`
- **描述**：获取指定资源下的所有操作（需要 system:resource:edit 权限）
- **查询参数**：
  - `page`：页码（默认 1）
  - `pageSize`：每页数量（默认 10）
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "list": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "description": "string",
          "icon": "string",
          "sort": "number",
          "needConfirm": "boolean",
          "confirmMessage": "string",
          "resourceId": "number",
          "permission": {
            "id": "number",
            "name": "string",
            "code": "string"
          }
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

### 6.3 获取单个资源操作

- **接口**：`GET /api/resources/:resourceId/actions/:id`
- **描述**：获取指定资源的单个操作详情（需要 system:resource:edit 权限）
- **响应**：同创建资源操作

### 6.4 更新资源操作

- **接口**：`PUT /api/resources/:resourceId/actions/:id`
- **描述**：更新指定资源的操作（需要 system:resource:edit 权限）
- **请求体**：同创建资源操作
- **响应**：同创建资源操作

### 6.5 删除资源操作

- **接口**：`DELETE /api/resources/:resourceId/actions/:id`
- **描述**：删除指定资源的操作（需要 system:resource:delete 权限）
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource action deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource action not found",
    "data": null
  }
  ```

---

# 说明

- 资源操作相关接口全部采用嵌套路由风格 `/api/resources/:resourceId/actions`。
- code 字段始终为 resourceCode:actionCode，后端自动处理。
- 删除资源时会级联删除所有 actions 及其权限。
