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
    // 确保数据库存在
    await createDatabaseIfNotExists();

    // 同步数据库模型
    await sequelize.sync();
    console.log("数据库同步完成");

    return true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

// 启动函数
async function bootstrap() {
  try {
    // 初始化数据库
    await initializeDatabase();

    // 只在非测试环境下显示启动信息
    if (process.env.NODE_ENV !== "test") {
      console.log("数据库初始化成功");

      // 启动服务器
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`✓ 服务器运行在 http://localhost:${PORT}`);
        console.log("----------------------------------------");
        console.log("默认管理员账号：");
        console.log("用户名：admin");
        console.log("密码：admin123");
        console.log("----------------------------------------");
        console.log("高级管理员账号：");
        console.log("用户名：manager");
        console.log("密码：manager123");
        console.log("----------------------------------------");
        console.log("普通管理员账号：");
        console.log("用户名：user");
        console.log("密码：user123");
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
