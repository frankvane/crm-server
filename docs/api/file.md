# 文件上传接口文档

## 1. 秒传确认

- **接口**：`POST /api/file/instant`
- **描述**：校验文件是否已上传（秒传），根据 file_id 和 md5 判断。
- **请求体**：
  ```json
  {
    "file_id": "string", // 文件唯一ID
    "md5": "string", // 文件MD5
    "name": "string", // 文件名
    "size": "number" // 文件大小
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "ok",
    "data": {
      "uploaded": true,
      "file": { /* 文件信息 */ }
    }
  }
  // 或
  {
    "code": 200,
    "message": "ok",
    "data": { "uploaded": false }
  }
  ```
- **错误响应**：
  ```json
  { "code": 400, "message": "参数缺失", "data": {} }
  { "code": 500, "message": "错误信息", "data": {} }
  ```

## 2. 状态查询

- **接口**：`GET /api/file/status`
- **描述**：查询已上传的分片索引。
- **查询参数**：
  - `file_id`：文件唯一 ID
  - `md5`：文件 MD5
- **响应**：
  ```json
  {
    "code": 200,
    "message": "ok",
    "data": { "chunks": [0, 1, 2] }
  }
  ```
- **错误响应**：
  ```json
  { "code": 400, "message": "参数缺失", "data": {} }
  { "code": 500, "message": "错误信息", "data": {} }
  ```

## 3. 分片上传

- **接口**：`POST /api/file/upload`
- **描述**：上传单个分片，需使用 multipart/form-data。
- **请求体**：
  - form-data 字段：
    - `file_id`：文件唯一 ID
    - `index`：分片索引（数字）
    - `user_id`：用户 ID（可选）
    - `chunk`：分片文件（二进制）
- **响应**：
  ```json
  { "code": 200, "message": "ok", "data": {} }
  ```
- **错误响应**：
  ```json
  { "code": 400, "message": "参数缺失", "data": {} }
  { "code": 400, "message": "index必须为数字", "data": {} }
  { "code": 500, "message": "错误信息", "data": {} }
  ```

## 4. 分片合并

- **接口**：`POST /api/file/merge`
- **描述**：合并所有分片为完整文件，并校验 MD5。
- **请求体**：
  ```json
  {
    "file_id": "string",
    "md5": "string",
    "name": "string",
    "size": "number",
    "total": "number", // 分片总数
    "user_id": "string" // 可选
  }
  ```
- **响应**：
  ```json
  { "code": 200, "message": "ok", "data": {} }
  ```
- **错误响应**：
  ```json
  { "code": 400, "message": "参数缺失", "data": {} }
  { "code": 500, "message": "错误信息", "data": {} }
  ```

---

# 说明

- 所有接口返回格式均为 `{ code, message, data }`。
- 文件上传采用分片方式，支持断点续传和秒传。
- 合并接口会校验 MD5，确保文件完整性。
- 上传目录为服务器本地，后续可扩展为云存储。
