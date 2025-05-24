# RBAC DEMO 数据示例（细化版）

本示例基于实际 models 结构和接口，便于前端开发模拟 RBAC 权限体系。

## 1. 角色（Role）

| id  | 角色名     | code    | 说明       |
| --- | ---------- | ------- | ---------- |
| 1   | 管理员     | admin   | 系统管理员 |
| 2   | 高级管理员 | manager | 高级管理员 |
| 3   | 普通管理员 | user    | 普通管理员 |

## 2. 权限（Permission）

| id  | name         | code                     | 描述         |
| --- | ------------ | ------------------------ | ------------ |
| 1   | 创建用户     | system:user:add          | 创建用户     |
| 2   | 查看用户     | system:user:view         | 查看用户     |
| 3   | 编辑用户     | system:user:edit         | 编辑用户     |
| 4   | 删除用户     | system:user:delete       | 删除用户     |
| 5   | 分配角色权限 | system:role:assign       | 分配角色权限 |
| 6   | 创建角色     | system:role:add          | 创建角色     |
| 7   | 编辑角色     | system:role:edit         | 编辑角色     |
| 8   | 删除角色     | system:role:delete       | 删除角色     |
| 9   | 创建资源     | system:resource:add      | 创建资源     |
| 10  | 编辑资源     | system:resource:edit     | 编辑资源     |
| 11  | 删除资源     | system:resource:delete   | 删除资源     |
| 12  | 查看资源     | system:resource:view     | 查看资源     |
| 13  | 管理分类类型 | category:type:manage     | 分类类型管理 |
| 14  | 查看分类类型 | category:type:view       | 查看分类类型 |
| 15  | 管理分类     | category:category:manage | 分类管理     |
| 16  | 查看分类     | category:category:view   | 查看分类     |

## 3. 资源菜单（Resource）

- 系统管理（/system, Layout）
  - 用户管理（system:user, /system/user）
  - 角色管理（system:role, /system/role）
  - 资源管理（system:resource, /system/resource）
- 分类管理（/category, Layout）
  - 分类类型管理（category:type, /category/type）
  - 分类管理（category:category, /category/category）

## 4. 按钮级操作（ResourceAction）

| id  | name | code   | resourceId | 说明     |
| --- | ---- | ------ | ---------- | -------- |
| 1   | 新增 | add    | 2          | 新增操作 |
| 2   | 编辑 | edit   | 2          | 编辑操作 |
| 3   | 删除 | delete | 2          | 删除操作 |
| 4   | 查看 | view   | 2          | 查看操作 |

## 5. 角色-权限分配

| 角色 code | 权限 code（部分）                                                                          |
| --------- | ------------------------------------------------------------------------------------------ |
| admin     | 所有权限                                                                                   |
| manager   | category:type:manage, category:type:view, category:category:manage, category:category:view |
| user      | category:category:view                                                                     |

## 6. 角色-菜单可见性

| 角色 code | 可见菜单资源 code                |
| --------- | -------------------------------- |
| admin     | 所有菜单                         |
| manager   | category:type, category:category |
| user      | category:category                |

## 7. 用户（User）

| id  | 用户名  | 密码       | 角色 code |
| --- | ------- | ---------- | --------- |
| 1   | admin   | admin123   | admin     |
| 2   | manager | manager123 | manager   |
| 3   | user    | user123    | user      |

## 8. 角色-权限-资源-操作关系示例

| 角色  | 权限点                 | 菜单资源 | 按钮操作   |
| ----- | ---------------------- | -------- | ---------- |
| admin | system:user:add        | 用户管理 | 新增、编辑 |
| admin | system:role:assign     | 角色管理 | 分配权限   |
| user  | category:category:view | 分类管理 | 查看       |

---

前端可根据上述结构，模拟菜单、按钮、权限点的动态渲染与控制。
