# 分类类型接口文档

## 1. 创建分类类型

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

## 2. 获取分类类型列表

- **接口**：`GET /api/category-types`
- **描述**：获取所有分类类型
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：分类类型数组

## 3. 获取单个分类类型

- **接口**：`GET /api/category-types/:id`
- **描述**：获取指定分类类型详情
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：分类类型对象

## 4. 更新分类类型

- **接口**：`PUT /api/category-types/:id`
- **描述**：更新指定分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建分类类型
- **响应**：分类类型对象

## 5. 删除分类类型

- **接口**：`DELETE /api/category-types/:id`
- **描述**：删除指定分类类型（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果

# 分类接口文档

## 1. 创建分类

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

## 2. 获取分类列表

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

## 3. 获取单个分类

- **接口**：`GET /api/categories/:id`
- **描述**：获取指定分类详情
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：分类对象

## 4. 获取分类树

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

## 5. 更新分类

- **接口**：`PUT /api/categories/:id`
- **描述**：更新指定分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建分类
- **响应**：分类对象

## 6. 删除分类

- **接口**：`DELETE /api/categories/:id`
- **描述**：删除指定分类（需要 manage_categories 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：删除结果
