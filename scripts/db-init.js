const { sequelize } = require("../models");

process.on("unhandledRejection", (error) => {
  console.error("未处理的Promise拒绝:", error);
  process.exit(1);
});

async function init() {
  try {
    console.log("正在连接数据库...");
    await sequelize.authenticate();
    console.log("数据库连接成功");

    console.log("正在同步数据库模型...");
    await sequelize.sync({ force: true });
    console.log("数据库模型同步成功");

    console.log("正在加载初始化数据...");
    const { up } = require("../seeders/init");
    await up(sequelize.getQueryInterface(), sequelize);
    console.log("初始化数据加载成功");

    console.log("数据库初始化完成");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("数据库初始化失败:", error);
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
}

init();
