# 资源操作管理接口文档

## 概述

资源操作(ResourceAction)是指针对特定资源的具体操作，如"新增"、"编辑"、"删除"等按钮级操作。
每个资源操作必须关联到一个具体的资源(Resource)，系统会为每个资源操作自动创建对应的权限。

## 1. 创建资源操作

- **接口**：`POST /api/resources/:resourceId/actions`
- **描述**：为指定资源创建操作（需要 system:resource:add 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string", // 操作名称，如"新增"、"编辑"、"删除"
    "code": "string", // 操作代码，如"add"、"edit"、"delete"，也可传完整格式 system:user:add
    "description": "string", // 操作描述
    "icon": "string", // 图标
    "sort": "number", // 排序号
    "needConfirm": "boolean", // 是否需要确认
    "confirmMessage": "string" // 确认消息
  }
  ```
- **code 字段说明**：
  - 支持传递单词（如 add）或完整格式（如 system:user:add），后端会自动拼接为 resourceCode:actionCode。
  - 最终 code 字段始终为 resourceCode:actionCode。
- **重要说明**：
  - `resourceId` 由路由参数指定，必须存在。
  - 系统会自动为每个资源操作创建一个对应格式的权限记录。
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "新增",
      "code": "system:user:add", // 自动组合为 resourceCode:actionCode
      "description": "新增用户",
      "icon": "plus",
      "sort": 1,
      "needConfirm": false,
      "confirmMessage": null,
      "resourceId": 2,
      "permission": {
        "id": 10,
        "name": "system:user:add",
        "code": "system:user:add",
        "description": "新增用户"
      }
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
  或
  ```json
  {
    "success": false,
    "message": "Resource action already exists",
    "data": null
  }
  ```

## 2. 获取资源操作列表

- **接口**：`GET /api/resources/:resourceId/actions`
- **描述**：获取指定资源下的所有操作（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
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
          "id": 1,
          "name": "新增",
          "code": "system:user:add",
          "description": "新增用户",
          "icon": "plus",
          "sort": 1,
          "needConfirm": false,
          "confirmMessage": null,
          "resourceId": 2,
          "permission": {
            "id": 10,
            "name": "system:user:add",
            "code": "system:user:add"
          }
        }
      ],
      "pagination": {
        "current": 1,
        "pageSize": 10,
        "total": 1
      }
    }
  }
  ```

## 3. 获取单个资源操作

- **接口**：`GET /api/resources/:resourceId/actions/:id`
- **描述**：获取指定资源的单个操作详情（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：同创建资源操作
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource action not found",
    "data": null
  }
  ```

## 4. 更新资源操作

- **接口**：`PUT /api/resources/:resourceId/actions/:id`
- **描述**：更新指定资源的操作（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建资源操作
- **响应**：同创建资源操作
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource action not found",
    "data": null
  }
  ```

## 5. 删除资源操作

- **接口**：`DELETE /api/resources/:resourceId/actions/:id`
- **描述**：删除指定资源的操作（需要 system:resource:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
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
