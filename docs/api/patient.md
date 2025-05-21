# 医患管理接口文档

## 1. 创建患者信息

### 请求信息
- 请求路径：`/api/patients`
- 请求方法：POST
- 权限要求：需要token认证

### 请求参数
```json
{
  "name": "张三",           // 患者姓名，必填
  "gender": "男",          // 性别，必填，可选值：男/女
  "birthday": "1990-01-01", // 出生日期，必填，格式：YYYY-MM-DD
  "phone": "13800138000",   // 联系电话，必填
  "id_card": "110101199001011234", // 身份证号，必填
  "address": "北京市朝阳区", // 居住地址，可选
  "remark": "高血压患者",    // 备注信息，可选
  "status": "active"        // 状态，可选，默认active
}
```

### 响应结果
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "张三",
    "gender": "男",
    "birthday": "1990-01-01",
    "phone": "13800138000",
    "id_card": "110101199001011234",
    "address": "北京市朝阳区",
    "remark": "高血压患者",
    "status": "active",
    "createdAt": "2025-05-21T08:30:00.000Z",
    "updatedAt": "2025-05-21T08:30:00.000Z"
  },
  "message": "创建成功"
}
```

## 2. 获取患者列表

### 请求信息
- 请求路径：`/api/patients`
- 请求方法：GET
- 权限要求：需要token认证

### 查询参数
- page：当前页码，默认1
- pageSize：每页数量，默认10
- name：患者姓名，模糊查询
- phone：联系电话，模糊查询
- id_card：身份证号，精确查询
- status：状态，精确查询

### 响应结果
```json
{
  "code": 200,
  "data": {
    "total": 100,
    "rows": [{
      "id": 1,
      "name": "张三",
      "gender": "男",
      "birthday": "1990-01-01",
      "phone": "13800138000",
      "id_card": "110101199001011234",
      "address": "北京市朝阳区",
      "remark": "高血压患者",
      "status": "active",
      "createdAt": "2025-05-21T08:30:00.000Z",
      "updatedAt": "2025-05-21T08:30:00.000Z"
    }]
  },
  "message": "获取成功"
}
```

## 3. 获取患者详情

### 请求信息
- 请求路径：`/api/patients/:id`
- 请求方法：GET
- 权限要求：需要token认证

### 路径参数
- id：患者ID，必填

### 响应结果
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "张三",
    "gender": "男",
    "birthday": "1990-01-01",
    "phone": "13800138000",
    "id_card": "110101199001011234",
    "address": "北京市朝阳区",
    "remark": "高血压患者",
    "status": "active",
    "createdAt": "2025-05-21T08:30:00.000Z",
    "updatedAt": "2025-05-21T08:30:00.000Z"
  },
  "message": "获取成功"
}
```

## 4. 更新患者信息

### 请求信息
- 请求路径：`/api/patients/:id`
- 请求方法：PUT
- 权限要求：需要token认证

### 路径参数
- id：患者ID，必填

### 请求参数
```json
{
  "name": "张三",           // 患者姓名，可选
  "gender": "男",          // 性别，可选
  "birthday": "1990-01-01", // 出生日期，可选
  "phone": "13800138000",   // 联系电话，可选
  "id_card": "110101199001011234", // 身份证号，可选
  "address": "北京市朝阳区", // 居住地址，可选
  "remark": "高血压患者",    // 备注信息，可选
  "status": "active"        // 状态，可选
}
```

### 响应结果
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "张三",
    "gender": "男",
    "birthday": "1990-01-01",
    "phone": "13800138000",
    "id_card": "110101199001011234",
    "address": "北京市朝阳区",
    "remark": "高血压患者",
    "status": "active",
    "createdAt": "2025-05-21T08:30:00.000Z",
    "updatedAt": "2025-05-21T08:30:00.000Z"
  },
  "message": "更新成功"
}
```

## 5. 删除患者信息

### 请求信息
- 请求路径：`/api/patients/:id`
- 请求方法：DELETE
- 权限要求：需要token认证

### 路径参数
- id：患者ID，必填

### 响应结果
```json
{
  "code": 200,
  "data": null,
  "message": "删除成功"
}
```

## 6. 批量删除患者信息

### 请求信息
- 请求路径：`/api/patients/batch`
- 请求方法：DELETE
- 权限要求：需要token认证

### 请求参数
```json
{
  "ids": [1, 2, 3]  // 患者ID数组，必填
}
```

### 响应结果
```json
{
  "code": 200,
  "data": null,
  "message": "批量删除成功"
}
``` 