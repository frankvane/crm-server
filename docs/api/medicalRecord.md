# 医疗记录管理接口文档

## 1. 创建医疗记录

### 请求信息
- 请求路径：`/api/medical-records`
- 请求方法：POST
- 权限要求：需要token认证

### 请求参数
```json
{
  "patient_id": 1,           // 患者ID，必填
  "diagnosis": "高血压",      // 诊断结果，必填
  "treatment": "降压药物治疗", // 治疗方案，必填
  "prescription": {          // 处方信息，必填
    "medicines": [
      {
        "name": "降压药",
        "dosage": "每日两次，每次一片",
        "duration": "7天"
      }
    ]
  },
  "visit_date": "2025-05-21", // 就诊日期，必填，格式：YYYY-MM-DD
  "next_visit": "2025-06-21", // 下次随访日期，可选，格式：YYYY-MM-DD
  "doctor_id": 1,            // 主治医生ID，必填
  "symptoms": "头痛、眩晕",   // 症状描述，必填
  "blood_pressure": "140/90", // 血压值，可选
  "heart_rate": 75,          // 心率，可选
  "remark": "建议清淡饮食",   // 备注信息，可选
  "status": "active"         // 状态，可选，默认active
}
```

### 响应结果
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "patient_id": 1,
    "diagnosis": "高血压",
    "treatment": "降压药物治疗",
    "prescription": {
      "medicines": [
        {
          "name": "降压药",
          "dosage": "每日两次，每次一片",
          "duration": "7天"
        }
      ]
    },
    "visit_date": "2025-05-21",
    "next_visit": "2025-06-21",
    "doctor_id": 1,
    "symptoms": "头痛、眩晕",
    "blood_pressure": "140/90",
    "heart_rate": 75,
    "remark": "建议清淡饮食",
    "status": "active",
    "createdAt": "2025-05-21T08:30:00.000Z",
    "updatedAt": "2025-05-21T08:30:00.000Z"
  },
  "message": "创建成功"
}
```

## 2. 获取医疗记录列表

### 请求信息
- 请求路径：`/api/medical-records`
- 请求方法：GET
- 权限要求：需要token认证

### 查询参数
- page：当前页码，默认1
- pageSize：每页数量，默认10
- patient_id：患者ID，精确查询
- doctor_id：医生ID，精确查询
- visit_date_start：就诊日期起始，格式：YYYY-MM-DD
- visit_date_end：就诊日期结束，格式：YYYY-MM-DD
- diagnosis：诊断结果，模糊查询
- status：状态，精确查询

### 响应结果
```json
{
  "code": 200,
  "data": {
    "total": 100,
    "rows": [{
      "id": 1,
      "patient_id": 1,
      "diagnosis": "高血压",
      "treatment": "降压药物治疗",
      "prescription": {
        "medicines": [
          {
            "name": "降压药",
            "dosage": "每日两次，每次一片",
            "duration": "7天"
          }
        ]
      },
      "visit_date": "2025-05-21",
      "next_visit": "2025-06-21",
      "doctor_id": 1,
      "symptoms": "头痛、眩晕",
      "blood_pressure": "140/90",
      "heart_rate": 75,
      "remark": "建议清淡饮食",
      "status": "active",
      "createdAt": "2025-05-21T08:30:00.000Z",
      "updatedAt": "2025-05-21T08:30:00.000Z",
      "patient": {
        "id": 1,
        "name": "张三",
        "gender": "男",
        "age": 45
      },
      "doctor": {
        "id": 1,
        "name": "李医生"
      }
    }]
  },
  "message": "获取成功"
}
```

## 3. 获取医疗记录详情

### 请求信息
- 请求路径：`/api/medical-records/:id`
- 请求方法：GET
- 权限要求：需要token认证

### 路径参数
- id：医疗记录ID，必填

### 响应结果
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "patient_id": 1,
    "diagnosis": "高血压",
    "treatment": "降压药物治疗",
    "prescription": {
      "medicines": [
        {
          "name": "降压药",
          "dosage": "每日两次，每次一片",
          "duration": "7天"
        }
      ]
    },
    "visit_date": "2025-05-21",
    "next_visit": "2025-06-21",
    "doctor_id": 1,
    "symptoms": "头痛、眩晕",
    "blood_pressure": "140/90",
    "heart_rate": 75,
    "remark": "建议清淡饮食",
    "status": "active",
    "createdAt": "2025-05-21T08:30:00.000Z",
    "updatedAt": "2025-05-21T08:30:00.000Z",
    "patient": {
      "id": 1,
      "name": "张三",
      "gender": "男",
      "age": 45
    },
    "doctor": {
      "id": 1,
      "name": "李医生"
    }
  },
  "message": "获取成功"
}
```

## 4. 更新医疗记录

### 请求信息
- 请求路径：`/api/medical-records/:id`
- 请求方法：PUT
- 权限要求：需要token认证

### 路径参数
- id：医疗记录ID，必填

### 请求参数
```json
{
  "diagnosis": "高血压",      // 诊断结果，可选
  "treatment": "降压药物治疗", // 治疗方案，可选
  "prescription": {          // 处方信息，可选
    "medicines": [
      {
        "name": "降压药",
        "dosage": "每日两次，每次一片",
        "duration": "7天"
      }
    ]
  },
  "next_visit": "2025-06-21", // 下次随访日期，可选
  "symptoms": "头痛、眩晕",   // 症状描述，可选
  "blood_pressure": "140/90", // 血压值，可选
  "heart_rate": 75,          // 心率，可选
  "remark": "建议清淡饮食",   // 备注信息，可选
  "status": "active"         // 状态，可选
}
```

### 响应结果
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "patient_id": 1,
    "diagnosis": "高血压",
    "treatment": "降压药物治疗",
    "prescription": {
      "medicines": [
        {
          "name": "降压药",
          "dosage": "每日两次，每次一片",
          "duration": "7天"
        }
      ]
    },
    "visit_date": "2025-05-21",
    "next_visit": "2025-06-21",
    "doctor_id": 1,
    "symptoms": "头痛、眩晕",
    "blood_pressure": "140/90",
    "heart_rate": 75,
    "remark": "建议清淡饮食",
    "status": "active",
    "createdAt": "2025-05-21T08:30:00.000Z",
    "updatedAt": "2025-05-21T08:30:00.000Z"
  },
  "message": "更新成功"
}
```

## 5. 删除医疗记录

### 请求信息
- 请求路径：`/api/medical-records/:id`
- 请求方法：DELETE
- 权限要求：需要token认证

### 路径参数
- id：医疗记录ID，必填

### 响应结果
```json
{
  "code": 200,
  "data": null,
  "message": "删除成功"
}
```

## 6. 获取患者的所有医疗记录

### 请求信息
- 请求路径：`/api/medical-records/patient/:patientId`
- 请求方法：GET
- 权限要求：需要token认证

### 路径参数
- patientId：患者ID，必填

### 查询参数
- page：当前页码，默认1
- pageSize：每页数量，默认10
- sort：排序字段，可选值：visit_date（默认）
- order：排序方式，可选值：DESC（默认）、ASC

### 响应结果
```json
{
  "code": 200,
  "data": {
    "total": 10,
    "rows": [{
      "id": 1,
      "patient_id": 1,
      "diagnosis": "高血压",
      "treatment": "降压药物治疗",
      "prescription": {
        "medicines": [
          {
            "name": "降压药",
            "dosage": "每日两次，每次一片",
            "duration": "7天"
          }
        ]
      },
      "visit_date": "2025-05-21",
      "next_visit": "2025-06-21",
      "doctor_id": 1,
      "symptoms": "头痛、眩晕",
      "blood_pressure": "140/90",
      "heart_rate": 75,
      "remark": "建议清淡饮食",
      "status": "active",
      "createdAt": "2025-05-21T08:30:00.000Z",
      "updatedAt": "2025-05-21T08:30:00.000Z",
      "doctor": {
        "id": 1,
        "name": "李医生"
      }
    }]
  },
  "message": "获取成功"
}
``` 