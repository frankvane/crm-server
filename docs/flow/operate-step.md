# RBAC 权限系统操作步骤（细化版）

本文档详细说明了 RBAC 权限系统的操作流程，包括管理员登录、用户管理、角色管理、权限分配、资源管理、按钮操作、以及大文件分片上传等步骤。

## 1. 管理员登录

### 1.1 登录接口

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **请求体**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 1.2 获取用户信息

- **URL**: `/api/users/me`
- **Method**: `GET`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "user": { "id": 1, "username": "admin", ... },
    "roles": [ ... ],
    "routes": [ ... ],
    "permissions": [ ... ]
  }
}
```

## 2. 用户管理

### 2.1 创建用户

- **URL**: `/api/users`
- **Method**: `POST`
- **请求体**:

```json
{
  "username": "testuser",
  "password": "test123",
  "email": "test@example.com",
  "roleIds": []
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "id": 2, "username": "testuser", ... }
}
```

### 2.2 查询用户列表

- **URL**: `/api/users`
- **Method**: `GET`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "rows": [ ... ], "count": 2 }
}
```

### 2.3 编辑用户

- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **请求体**:

```json
{
  "email": "new@example.com",
  "status": 1
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

### 2.4 删除用户

- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

## 3. 角色管理

### 3.1 创建角色

- **URL**: `/api/roles`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "普通用户",
  "code": "user",
  "description": "普通用户角色"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "id": 2, "name": "普通用户", ... }
}
```

### 3.2 查询角色列表

- **URL**: `/api/roles`
- **Method**: `GET`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "rows": [ ... ], "count": 2 }
}
```

### 3.3 编辑角色

- **URL**: `/api/roles/:id`
- **Method**: `PUT`
- **请求体**:

```json
{
  "description": "新描述"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

### 3.4 删除角色

- **URL**: `/api/roles/:id`
- **Method**: `DELETE`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

### 3.5 分配权限给角色

- **URL**: `/api/roles/:id/permissions`
- **Method**: `POST`
- **请求体**:

```json
{
  "permissionIds": [1, 2, 3]
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

### 3.6 分配资源给角色

- **URL**: `/api/roles/:id/resources`
- **Method**: `POST`
- **请求体**:

```json
{
  "resourceIds": [1, 2, 3]
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

## 4. 权限与资源管理

### 4.1 创建权限

- **URL**: `/api/permissions`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "查看用户",
  "code": "system:user:view",
  "description": "查看用户列表"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "id": 1, ... }
}
```

### 4.2 创建资源

- **URL**: `/api/resources`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "用户管理",
  "code": "system:user",
  "type": "menu",
  "parentId": 1,
  "meta": { "title": "用户管理", "icon": "用户" }
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "id": 2, ... }
}
```

### 4.3 创建资源操作

- **URL**: `/api/resource-actions`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "查看用户",
  "code": "view",
  "resourceId": 2
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "id": 1, ... }
}
```

## 5. 大文件分片上传操作（附录）

### 5.1 秒传确认

- **URL**: `/api/file/instant`
- **Method**: `POST`
- **请求体**:

```json
{
  "file_id": "md5-文件名-大小",
  "md5": "...",
  "name": "xxx.png",
  "size": 123456
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "uploaded": false }
}
```

### 5.2 查询已上传分片

- **URL**: `/api/file/status`
- **Method**: `GET`
- **请求参数**: `file_id`, `md5`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "chunks": [0, 1, 2] }
}
```

### 5.3 分片上传

- **URL**: `/api/file/upload`
- **Method**: `POST`
- **请求体**: FormData，字段包括 `file_id`, `index`, `chunk`, `name`, `total`
- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

### 5.4 分片合并

- **URL**: `/api/file/merge`
- **Method**: `POST`
- **请求体**:

```json
{
  "file_id": "...",
  "md5": "...",
  "name": "xxx.png",
  "size": 123456,
  "total": 5
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```
