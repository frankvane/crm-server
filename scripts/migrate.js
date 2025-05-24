const { Sequelize } = require("sequelize");
const config = require("../config/database");
const fs = require("fs");
const path = require("path");

const sequelize = new Sequelize(config);

async function migrate() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log("数据库连接成功");

    // 读取迁移文件目录
    const migrationsPath = path.join(__dirname, "../migrations");
    const files = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith(".js"))
      .sort(); // 确保按文件名顺序执行

    console.log("将要执行的迁移文件:", files);

    // 执行迁移
    for (const file of files) {
      try {
        console.log(`\n开始执行迁移: ${file}`);
        const migration = require(path.join(migrationsPath, file));

        if (typeof migration.up === "function") {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          console.log(`迁移完成: ${file}`);
        } else {
          console.warn(`警告: ${file} 中没有找到 up 方法`);
        }
      } catch (error) {
        console.error(`\n执行迁移 ${file} 时出错:`);
        console.error("错误类型:", error.name);
        console.error("错误消息:", error.message);

        if (error.parent) {
          console.error("\n原始错误:");
          console.error("SQL:", error.sql);

          if (error.parent.errors) {
            error.parent.errors.forEach((err, index) => {
              console.error(`\n详细错误 ${index + 1}:`);
              console.error("代码:", err.code);
              console.error("消息:", err.message);
              if (err.sql) console.error("SQL:", err.sql);
            });
          }
        }

        throw new Error(`迁移 ${file} 失败`);
      }
    }

    console.log("\n所有迁移执行完成");

    // 执行初始化数据
    console.log("\n开始执行数据初始化...");
    const init = require("../seeders/init");
    await init.up(sequelize.getQueryInterface(), Sequelize);
    console.log("数据初始化完成");

    process.exit(0);
  } catch (error) {
    console.error("\n执行失败:");
    console.error(error);
    process.exit(1);
  }
}

migrate();
