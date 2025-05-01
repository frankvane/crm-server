# CRM Server

基于 **Node.js + Express + Sequelize + SQL Server** 的 CRM 权限管理基础模块，支持 RBAC 权限模型、JWT 双 Token 认证、无限级分类。

---

## 🚀 技术栈

- Node.js
- Express
- Sequelize (ORM)
- SQL Server (MSSQL)
- JWT (jsonwebtoken)
- bcryptjs
- dotenv

## ⚙️ 环境配置

1. 安装依赖：`npm install`
2. 配置 `.env` 文件，填写数据库和 JWT 密钥等信息：
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=1433
   DB_USER=sa
   DB_PASS=your_password
   DB_NAME=crm
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ACCESS_TOKEN_EXPIRES_IN=1d
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```
3. 启动 SQL Server 并创建数据库

## 🛠️ 数据库初始化

### 自动初始化（推荐）

启动应用时会自动执行数据库同步和初始化：

```bash
npm start
```

### 手动初始化

1. 安装 sequelize-cli（如未安装）：
   ```bash
   npm install -g sequelize-cli
   ```
2. 创建数据库（如不存在）：
   ```sql
   CREATE DATABASE crm;
   ```
3. 执行数据库迁移（创建表结构）：
   ```bash
   npx sequelize-cli db:migrate
   ```
4. 执行种子数据脚本（创建初始数据）：
   ```bash
   npx sequelize-cli db:seed:all
   ```

### 重置数据库

1. 回滚所有迁移：
   ```bash
   npx sequelize-cli db:migrate:undo:all
   ```
2. 重新执行迁移：
   ```bash
   npx sequelize-cli db:migrate
   ```
3. 重新执行种子数据脚本：
   ```bash
   npx sequelize-cli db:seed:all
   ```

## ▶️ 启动方式

```bash
npm start
```

## 👤 默认账户

- 管理员账号：admin
- 管理员密码：admin123

## 📚 文档导航

- [目录结构](docs/tree.md)
- [认证接口](docs/auth.md)
- [用户管理接口](docs/user.md)
- [分类管理接口](docs/category.md)
- [角色管理接口](docs/role.md)
- [资源管理接口](docs/resource.md)
- [更新日志](UPDATE.md)

---

如需详细接口说明、权限模型、响应格式等，请参见 docs 目录下各模块文档。

```sql
-- 禁用外键约束
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL"

-- 删除所有表
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(name) + N'; '
FROM sys.tables
WHERE type = 'U'
ORDER BY create_date DESC;

EXEC sp_executesql @sql;

-- 启用外键约束
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL"
```
