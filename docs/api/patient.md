# 病患管理接口文档

## 1. 创建病患

- **接口**：`POST /api/patients`
- **描述**：创建新病患
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "name": "string",
    "gender": 1,
    "birthday": "2020-01-01",
    "phone": "string",
    "id_card": "string",
    "address": "string",
    "emergency_contact": "string",
    "emergency_phone": "string",
    "doctor": "string",
    "remark": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "病患创建成功",
    "data": { ...病患对象... }
  }
  ```

## 2. 获取病患列表

- **接口**：`GET /api/patients`
- **描述**：获取病患列表
- **认证**：需要有效的访问令牌（Bearer Token）
- **查询参数**：
  - page: 页码（默认：1）
  - pageSize: 每页数量（默认：20）
  - search: 关键词（支持姓名、手机号、身份证、主治医师模糊查询）
  - name: 姓名
  - phone: 手机号
  - id_card: 身份证号
  - status: 状态
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "list": [ ...病患对象... ],
      "pagination": {
        "current": 1,
        "pageSize": 20,
        "total": 100
      }
    }
  }
  ```

## 3. 获取单个病患

- **接口**：`GET /api/patients/:id`
- **描述**：获取指定病患信息
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": { ...病患对象... }
  }
  ```

## 4. 更新病患

- **接口**：`PUT /api/patients/:id`
- **描述**：更新指定病患信息
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建病患
- **响应**：同获取单个病患

## 5. 删除病患

- **接口**：`DELETE /api/patients/:id`
- **描述**：删除指定病患
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：
  ```json
  {
    "success": true,
    "message": "病患删除成功",
    "data": null
  }
  ```

## 6. 批量删除病患

- **接口**：`POST /api/patients/deleteMany`
- **描述**：批量删除病患
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "批量删除成功",
    "data": { "deleted": 3 }
  }
  ``` 