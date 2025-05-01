# 命名规范

## 数据库关联别名命名规范

在模型关联和查询中，我们遵循以下命名规范：

### 1. 多对多关联 (Many-to-Many)

- 使用复数形式
- 示例：`roles`, `permissions`, `resources`

### 2. 一对一关联 (One-to-One) 或多对一关联 (Many-to-One)

- 使用单数形式
- 示例：`resource`, `action`, `parent`

### 3. 一对多关联 (One-to-Many)

- 根据语义选择单数或复数形式
- 示例：`children`, `actions`

### 4. 大小写规范

- 统一使用小写
- 不要混用大小写（例如：不要使用 `Permissions`，应该使用 `permissions`）

### 5. 当前使用的关联别名

#### User 模型

- User -> Role: `"roles"`
- User -> RefreshToken: `"refreshTokens"`

#### Role 模型

- Role -> User: `"users"`
- Role -> Permission: `"permissions"`
- Role -> Resource: `"resources"`

#### Permission 模型

- Permission -> Resource: `"resource"`
- Permission -> ResourceAction: `"action"`
- Permission -> Role: `"roles"`

#### Resource 模型

- Resource -> Resource (self): `"parent"` 和 `"children"`
- Resource -> Role: `"roles"`
- Resource -> Permission: `"permissions"`
- Resource -> ResourceAction: `"actions"`

#### ResourceAction 模型

- ResourceAction -> Resource: `"resource"`
- ResourceAction -> Permission: `"permission"`
