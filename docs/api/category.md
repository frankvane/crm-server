# 分类类型接口文档

## 1. 创建分类类型

- **接口**：`POST /api/category-types`
- **描述**：创建新的分类类型（需要 category:type:add 权限）
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
    "message": "Category type name or code already exists",
    "data": null
  }
  ```

## 2. 获取分类类型列表（分页）

- **接口**：`GET /api/category-types`
- **描述**：获取分类类型列表，支持分页、状态筛选和多种搜索方式（需要 category:type:view 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `page`：页码（默认：1）
  - `pageSize`：每页数量（默认：10）
  - `status`：状态筛选（可选，true/false）
  - `search`：全字段模糊搜索，会搜索 name、code、description 字段
  - `name`：按名称模糊搜索
  - `code`：按代码模糊搜索
  - `description`：按描述模糊搜索
- **搜索示例**：

  ```
  # 全字段模糊搜索
  GET /api/category-types?search=test

  # 指定字段搜索
  GET /api/category-types?name=test&code=A001

  # 组合搜索（支持 search、name、code、description、status 任意组合）
  GET /api/category-types?search=test&name=admin&status=true
  ```

- **响应**：
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "list": [
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
      "pagination": {
        "current": "number",
        "pageSize": "number",
        "total": "number"
      }
    }
  }
  ```

## 3. 获取所有分类类型（不分页）

- **接口**：`GET /api/category-types/all`
- **描述**：获取所有分类类型，不分页（需要 category:type:view 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `status`：状态筛选（可选，true/false）
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
        "description": "string",
        "status": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  }
  ```

## 4. 获取单个分类类型

- **接口**：`GET /api/category-types/:id`
- **描述**：获取指定分类类型详情（需要 category:type:view 权限）
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

## 5. 更新分类类型

- **接口**：`PUT /api/category-types/:id`
- **描述**：更新指定分类类型（需要 category:type:edit 权限）
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
  或
  ```json
  {
    "code": 400,
    "message": "Category type code already exists",
    "data": null
  }
  ```

## 6. 删除分类类型

- **接口**：`DELETE /api/category-types/:id`
- **描述**：删除指定分类类型（需要 category:type:delete 权限）
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
    "code": 404,
    "message": "Category type not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "code": 400,
    "message": "Cannot delete category type with associated categories",
    "data": null
  }
  ```

# 分类接口文档

## 1. 创建分类

- **接口**：`POST /api/categories`
- **描述**：创建新的分类（需要 system:category:add 权限）
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
    "success": true,
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
      "updatedAt": "string",
      "type": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "parent": {
        "id": "number",
        "name": "string",
        "code": "string"
      }
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category code already exists",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Category type not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Parent category not found",
    "data": null
  }
  ```

## 2. 获取分类列表

- **接口**：`GET /api/categories`
- **描述**：获取所有分类（需指定 typeId 查询参数）（需要 system:category:view 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `typeId`：分类类型 ID（必填）
- **示例**：
  ```
  GET /api/categories?typeId=1
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
        "typeId": "number",
        "parentId": "number",
        "sort": "number",
        "description": "string",
        "type": {
          "id": "number",
          "name": "string",
          "code": "string"
        },
        "parent": {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      }
    ]
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "TypeId is required",
    "data": null
  }
  ```

## 3. 获取单个分类

- **接口**：`GET /api/categories/:id`
- **描述**：获取指定分类详情（需要 system:category:view 权限）
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
      "typeId": "number",
      "parentId": "number",
      "sort": "number",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "type": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "parent": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "children": [ ... ] // 子分类
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category not found",
    "data": null
  }
  ```

## 4. 获取分类树

- **接口**：`GET /api/categories/tree`
- **描述**：获取分类树结构（需指定 typeId 查询参数）（需要 system:category:view 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `typeId`：分类类型 ID（必填）
- **示例**：
  ```
  GET /api/categories/tree?typeId=1
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
        "typeId": "number",
        "parentId": "number",
        "sort": "number",
        "description": "string",
        "children": [ ... ] // 嵌套的子分类
      }
    ]
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "TypeId is required",
    "data": null
  }
  ```

## 5. 更新分类

- **接口**：`PUT /api/categories/:id`
- **描述**：更新指定分类（需要 system:category:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建分类
- **响应**：同获取单个分类
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Category code already exists",
    "data": null
  }
  ```

## 6. 删除分类

- **接口**：`DELETE /api/categories/:id`
- **描述**：删除指定分类（需要 system:category:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Category deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete category with child categories",
    "data": null
  }
  ```
