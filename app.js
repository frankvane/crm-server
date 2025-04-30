require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { errorHandler } = require("./middlewares");
const { sequelize, User, Role, Permission } = require("./models");
const createInitialData = require("./seeders/init");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");

const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// 配置路由
app.use("/api", routes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 0,
    msg: "服务器内部错误",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 创建数据库
async function createDatabaseIfNotExists() {
  try {
    // 创建一个新的连接，连接到master数据库
    const masterSequelize = new Sequelize(
      "master",
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mssql",
        dialectOptions: {
          options: {
            encrypt: false,
          },
        },
      }
    );

    // 检查数据库是否存在
    const [results] = await masterSequelize.query(
      `SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME}'`
    );

    if (results.length === 0) {
      // 数据库不存在，创建它
      await masterSequelize.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`数据库 ${process.env.DB_NAME} 创建成功`);
    } else {
      console.log(`数据库 ${process.env.DB_NAME} 已存在`);
    }

    // 关闭master数据库连接
    await masterSequelize.close();
  } catch (error) {
    console.error("创建数据库失败:", error);
    throw error;
  }
}

// 初始化数据库和基础数据
async function initializeDatabase() {
  try {
    // 只在非测试环境下创建数据库
    if (process.env.NODE_ENV !== "test") {
      await createDatabaseIfNotExists();
    }

    // 同步数据库模型：仅在开发环境使用 force: true，测试环境不重建表
    const syncOptions = {
      force: process.env.NODE_ENV === "development",
      alter: process.env.NODE_ENV === "production",
    };

    await sequelize.sync(syncOptions);
    console.log("数据库同步完成");

    // 只在非测试环境下初始化基础数据
    if (process.env.NODE_ENV !== "test") {
      // 检查是否需要创建管理员用户
      let adminUser = await User.findOne({
        where: { username: "admin" },
      });

      if (!adminUser) {
        // 创建管理员用户
        const hashedPassword = await bcrypt.hash("admin123", 10);
        adminUser = await User.create({
          username: "admin",
          password: hashedPassword,
          email: "admin@example.com",
          status: 1,
        });
        console.log("管理员用户创建成功");
      }

      // 检查是否需要创建管理员角色
      let adminRole = await Role.findOne({
        where: { name: "管理员" },
      });

      if (!adminRole) {
        // 创建管理员角色
        adminRole = await Role.create({
          name: "管理员",
          description: "系统管理员",
        });
        console.log("管理员角色创建成功");
      }

      // 检查用户是否已关联角色
      const hasRole = await adminUser.hasRole(adminRole);
      if (!hasRole) {
        await adminUser.addRole(adminRole);
        console.log("管理员用户角色关联成功");
      }

      // 检查并创建基础权限
      const basePermissions = [
        { name: "用户管理", action: "manage", resource: "users" },
        { name: "角色管理", action: "manage", resource: "roles" },
        { name: "权限管理", action: "manage", resource: "permissions" },
      ];

      for (const perm of basePermissions) {
        const [permission] = await Permission.findOrCreate({
          where: {
            action: perm.action,
            resource: perm.resource,
          },
          defaults: {
            name: perm.name,
            description: `${perm.name}的所有权限`,
          },
        });

        // 确保管理员角色有这些权限
        const hasPermission = await adminRole.hasPermission(permission);
        if (!hasPermission) {
          await adminRole.addPermission(permission);
        }
      }
      console.log("基础权限初始化完成");
    }

    return true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

// 启动函数
async function bootstrap() {
  try {
    // 初始化数据库和基础数据
    await initializeDatabase();

    // 只在非测试环境下显示启动信息
    if (process.env.NODE_ENV !== "test") {
      console.log("数据库和基础数据初始化成功");

      // 启动服务器
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`✓ 服务器运行在 http://localhost:${PORT}`);
        console.log("----------------------------------------");
        console.log("初始账号：admin");
        console.log("初始密码：admin123");
        console.log("----------------------------------------");
      });
    }
  } catch (error) {
    console.error("启动失败:", error);
    process.exit(1);
  }
}

// 启动应用
bootstrap();

module.exports = app;
