const { sequelize } = require("../models");

async function clearDatabase() {
  try {
    // 禁用外键约束
    await sequelize.query(
      "EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'"
    );

    // 删除所有表中的数据
    await sequelize.query("EXEC sp_MSforeachtable 'DELETE FROM ?'");

    // 重新启用外键约束
    await sequelize.query(
      "EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL'"
    );

    console.log("数据库清理完成");
  } catch (error) {
    console.error("清理数据库时出错:", error);
    throw error;
  }
}

module.exports = {
  clearDatabase,
};
