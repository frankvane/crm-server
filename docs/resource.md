# 资源管理接口文档

## 1. 创建资源

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
    "meta": { ... },
    "description": "string"
  }
  ```
- **响应**：资源对象

## 2. 获取资源列表

- **接口**：`GET /api/resources`
- **描述**：获取所有资源（需要 view_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源数组

## 3. 获取单个资源

- **接口**：`GET /api/resources/:id`
- **描述**：获取指定资源详情（需要 view_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源对象

## 4. 更新资源

- **接口**：`PUT /api/resources/:id`
- **描述**：更新指定资源（需要 manage_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建资源
- **响应**：资源对象

## 5. 删除资源

- **接口**：`DELETE /api/resources/:id`
- **描述**：删除指定资源（需要 manage_resources 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果

# 资源操作管理接口文档

## 1. 创建资源操作

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

## 2. 获取资源操作列表

- **接口**：`GET /api/resource-actions`
- **描述**：获取所有资源操作（需要 view_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源操作数组

## 3. 获取单个资源操作

- **接口**：`GET /api/resource-actions/:id`
- **描述**：获取指定资源操作详情（需要 view_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：资源操作对象

## 4. 更新资源操作

- **接口**：`PUT /api/resource-actions/:id`
- **描述**：更新指定资源操作（需要 manage_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建资源操作
- **响应**：资源操作对象

## 5. 删除资源操作

- **接口**：`DELETE /api/resource-actions/:id`
- **描述**：删除指定资源操作（需要 manage_resource_actions 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果
