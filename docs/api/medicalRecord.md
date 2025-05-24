# 病例管理接口文档

## 1. 创建病例

- **接口**：`POST /api/medical-records`
- **描述**：创建新病例
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "patient_id": 1,
    "visit_date": "2024-05-19",
    "diagnosis": "感冒",
    "treatment": "多喝水，休息",
    "doctor": "王医生",
    "remark": "无特殊情况"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "病例创建成功",
    "data": { ...病例对象... }
  }
  ```

## 2. 获取病例列表

- **接口**：`GET /api/medical-records`
- **描述**：获取病例列表
- **认证**：需要有效的访问令牌（Bearer Token）
- **查询参数**：
  - page: 页码（默认：1）
  - pageSize: 每页数量（默认：20）
  - search: 关键词（支持诊断、治疗、主治医师、备注模糊查询）
  - patient_id: 病患ID
  - doctor: 主治医师
  - status: 状态
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "list": [ ...病例对象... ],
      "pagination": {
        "current": 1,
        "pageSize": 20,
        "total": 100
      }
    }
  }
  ```

## 3. 获取单个病例

- **接口**：`GET /api/medical-records/:id`
- **描述**：获取指定病例信息
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": { ...病例对象... }
  }
  ```

## 4. 更新病例

- **接口**：`PUT /api/medical-records/:id`
- **描述**：更新指定病例信息
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：同创建病例
- **响应**：同获取单个病例

## 5. 删除病例

- **接口**：`DELETE /api/medical-records/:id`
- **描述**：删除指定病例
- **认证**：需要有效的访问令牌（Bearer Token）
- **响应**：
  ```json
  {
    "success": true,
    "message": "病例删除成功",
    "data": null
  }
  ```

## 6. 批量删除病例

- **接口**：`POST /api/medical-records/deleteMany`
- **描述**：批量删除病例
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

## 7. 解密病例

- **接口**：`POST /api/medical-records/decrypt`
- **描述**：解密病例数据（前端传加密数据，后端解密返回明文）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求体**：
  ```json
  {
    "encryptedData": "string",      // 加密的病例数据（Base64）
    "encryptedAesKey": "string",    // 用公钥加密的AES密钥（Base64）
    "iv": "string"                  // AES加密用的IV（hex字符串）
  }
  ```
- **响应**：
  ```json
  {
    "decrypted": "解密后的明文数据"
  }
  ```
- **参数不全时响应**：
  ```json
  {
    "error": "参数不全"
  }
  ```
- **错误响应**：
  ```json
  {
    "error": "解密失败",
    "detail": "错误信息"
  }
  ``` 