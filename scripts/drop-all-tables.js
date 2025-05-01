const { Sequelize } = require("sequelize");
const config = require("../config/config.json");

async function dropAllTables() {
  const env = process.env.NODE_ENV || "development";
  const dbConfig = config[env];

  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: false,
    }
  );

  try {
    // 获取所有表名
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_CATALOG = '${dbConfig.database}'
      AND TABLE_SCHEMA = 'dbo'
    `);

    // 禁用外键约束
    await sequelize.query(
      'EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"'
    );

    // 删除所有表
    for (const result of results) {
      const tableName = result.TABLE_NAME;
      await sequelize.query(`DROP TABLE [${tableName}]`);
      console.log(`Dropped table: ${tableName}`);
    }

    console.log("All tables have been dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    await sequelize.close();
  }
}

dropAllTables();
