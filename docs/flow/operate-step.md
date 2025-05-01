# RBAC 权限系统操作步骤

本文档详细说明了 RBAC 权限系统的操作流程，包括管理员登录、用户管理、角色管理、权限分配等步骤。

## 1. 管理员登录

管理员登录后可以访问所有菜单和功能。

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
  "message": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

### 1.2 获取用户信息

登录成功后，系统会自动获取用户信息，包括菜单和权限。

- **URL**: `/api/users/me`
- **Method**: `GET`
- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "status": 1
    },
    "roles": [
      {
        "id": 1,
        "name": "超级管理员",
        "code": "super_admin"
      }
    ],
    "routes": [
      {
        "id": 1,
        "name": "系统管理",
        "path": "/system",
        "component": "Layout",
        "meta": {
          "title": "系统管理",
          "icon": "系统"
        },
        "children": [
          {
            "id": 2,
            "name": "用户管理",
            "path": "user",
            "component": "system/user/index",
            "meta": {
              "title": "用户管理",
              "icon": "用户"
            }
          },
          {
            "id": 3,
            "name": "角色管理",
            "path": "role",
            "component": "system/role/index",
            "meta": {
              "title": "角色管理",
              "icon": "角色"
            }
          }
        ]
      }
    ],
    "permissions": [
      "create_user",
      "view_users",
      "update_user",
      "delete_user",
      "manage_roles",
      "view_roles",
      "manage_resources",
      "view_resources"
    ]
  }
}
```

## 2. 创建新用户

### 2.1 创建用户接口

- **URL**: `/api/users`
- **Method**: `POST`
- **请求体**:

```json
{
  "username": "testuser",
  "password": "test123",
  "email": "test@example.com",
  "roleIds": [] // 初始不分配角色
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "username": "testuser",
    "email": "test@example.com",
    "status": 1,
    "roles": []
  }
}
```

## 3. 创建角色

在给用户分配角色之前，需要先创建角色。

### 3.1 创建角色接口

- **URL**: `/api/roles`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "普通用户",
  "code": "normal_user",
  "description": "普通用户角色",
  "permissionIds": [], // 初始不分配权限
  "resourceIds": [] // 初始不分配资源
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "name": "普通用户",
    "code": "normal_user",
    "description": "普通用户角色",
    "permissions": [],
    "resources": []
  }
}
```

## 4. 分配权限

### 4.1 创建资源（菜单和按钮）

首先创建菜单资源，然后创建对应的按钮资源。

#### 4.1.1 创建菜单资源

- **URL**: `/api/resources`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "用户管理",
  "code": "system:user",
  "path": "user",
  "component": "system/user/index",
  "type": "menu",
  "parentId": 1, // 父级菜单ID
  "meta": {
    "title": "用户管理",
    "icon": "用户",
    "noCache": false
  }
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "name": "用户管理",
    "code": "system:user",
    "path": "user",
    "component": "system/user/index",
    "type": "menu",
    "parentId": 1,
    "meta": {
      "title": "用户管理",
      "icon": "用户",
      "noCache": false
    }
  }
}
```

#### 4.1.2 创建按钮资源

- **URL**: `/api/resources`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "查看用户",
  "code": "system:user:view",
  "type": "button",
  "parentId": 2, // 关联到用户管理菜单
  "meta": {
    "title": "查看用户",
    "icon": "查看"
  }
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 3,
    "name": "查看用户",
    "code": "system:user:view",
    "type": "button",
    "parentId": 2,
    "meta": {
      "title": "查看用户",
      "icon": "查看"
    }
  }
}
```

### 4.2 创建权限

为每个资源创建对应的权限。

- **URL**: `/api/permissions`
- **Method**: `POST`
- **请求体**:

```json
{
  "name": "view_users",
  "code": "view_users",
  "description": "查看用户列表",
  "resourceId": 3, // 关联到"查看用户"按钮资源
  "type": "button"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "view_users",
    "code": "view_users",
    "description": "查看用户列表",
    "resourceId": 3,
    "type": "button",
    "resource": {
      "id": 3,
      "name": "查看用户",
      "code": "system:user:view"
    }
  }
}
```

### 4.3 给角色分配资源

分配资源时可以同时指定该资源下的具体权限。

- **URL**: `/api/roles/:id/resources`
- **Method**: `PUT`
- **请求体**:

```json
{
  "resources": [
    {
      "resourceId": 2, // 用户管理菜单
      "permissionIds": [] // 菜单资源通常不需要具体权限
    },
    {
      "resourceId": 3, // 查看用户按钮
      "permissionIds": [1] // 分配查看权限
    },
    {
      "resourceId": 4, // 编辑用户按钮
      "permissionIds": [2, 3] // 分配查看和编辑权限
    }
  ]
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "name": "普通用户",
    "resources": [
      {
        "id": 2,
        "name": "用户管理",
        "type": "menu",
        "path": "user",
        "permissions": []
      },
      {
        "id": 3,
        "name": "查看用户",
        "type": "button",
        "parentId": 2,
        "permissions": [
          {
            "id": 1,
            "name": "view_users",
            "code": "view_users"
          }
        ]
      },
      {
        "id": 4,
        "name": "编辑用户",
        "type": "button",
        "parentId": 2,
        "permissions": [
          {
            "id": 2,
            "name": "view_users",
            "code": "view_users"
          },
          {
            "id": 3,
            "name": "update_users",
            "code": "update_users"
          }
        ]
      }
    ]
  }
}
```

## 5. 给用户分配角色

### 5.1 分配角色接口

- **URL**: `/api/users/:id/roles`
- **Method**: `PUT`
- **请求体**:

```json
{
  "roleIds": [2] // 角色ID列表
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "username": "testuser",
    "roles": [
      {
        "id": 2,
        "name": "普通用户",
        "code": "normal_user",
        "resources": [
          {
            "id": 2,
            "name": "用户管理",
            "type": "menu",
            "path": "user",
            "permissions": []
          },
          {
            "id": 3,
            "name": "查看用户",
            "type": "button",
            "parentId": 2,
            "permissions": [
              {
                "id": 1,
                "name": "view_users",
                "code": "view_users"
              }
            ]
          },
          {
            "id": 4,
            "name": "编辑用户",
            "type": "button",
            "parentId": 2,
            "permissions": [
              {
                "id": 2,
                "name": "view_users",
                "code": "view_users"
              },
              {
                "id": 3,
                "name": "update_users",
                "code": "update_users"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## 6. 验证权限

### 6.1 用户登录

新用户登录后，系统会根据其角色返回对应的菜单和权限。

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **请求体**:

```json
{
  "username": "testuser",
  "password": "test123"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

### 6.2 获取用户信息

- **URL**: `/api/users/me`
- **Method**: `GET`
- **响应**:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": 2,
      "username": "testuser",
      "email": "test@example.com",
      "status": 1
    },
    "roles": [
      {
        "id": 2,
        "name": "普通用户",
        "code": "normal_user"
      }
    ],
    "routes": [
      {
        "id": 1,
        "name": "系统管理",
        "path": "/system",
        "component": "Layout",
        "meta": {
          "title": "系统管理",
          "icon": "系统"
        },
        "children": [
          {
            "id": 2,
            "name": "用户管理",
            "path": "user",
            "component": "system/user/index",
            "meta": {
              "title": "用户管理",
              "icon": "用户"
            }
          }
        ]
      }
    ],
    "permissions": ["view_users", "create_user", "update_user"]
  }
}
```

## 注意事项

1. 权限分配顺序：

   - 先创建资源（菜单和按钮）
   - 为资源创建对应的权限
   - 创建角色
   - 给角色分配资源（自动包含对应的权限）
   - 最后给用户分配角色

2. 资源类型：

   - 菜单（type = "menu"）：系统菜单项
   - 按钮（type = "button"）：菜单下的操作按钮
   - 每个按钮资源必须关联到其所属的菜单资源

3. 权限与资源关系：

   - 每个资源都有对应的权限
   - 权限与资源是多对一的关系（一个资源可以有多个权限）
   - 分配资源时可以指定该资源下的具体权限组合
   - 菜单资源通常不需要具体权限，按钮资源需要指定权限

4. 权限命名规范：

   - 创建：create_xxx
   - 查看：view_xxx
   - 更新：update_xxx
   - 删除：delete_xxx
   - 管理：manage_xxx

5. 资源编码规范：
   - 菜单：system:module
   - 按钮：system:module:action
