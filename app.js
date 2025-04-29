require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { errorHandler } = require("./middlewares");
const { sequelize } = require("./models");
const createInitialData = require("./seeders/init");

const app = express();

// 配置中间件
app.use(express.json());
app.use(morgan("dev"));

// 配置路由
app.use("/api", routes);

// 错误处理中间件
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// 启动服务器并初始化数据
async function bootstrap() {
  try {
    // 同步数据库结构
    await sequelize.sync({ force: true });

    // 检查是否需要初始化数据
    const adminExists = await sequelize.models.User.findOne({
      where: { username: "admin" },
    });

    if (!adminExists) {
      console.log("Initializing database with seed data...");
      await createInitialData();
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

bootstrap();
