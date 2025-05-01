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

    // 删除所有扩展属性
    await sequelize.query(`
      DECLARE @SQL NVARCHAR(MAX) = N'';
      SELECT @SQL += N'
      EXEC sys.sp_dropextendedproperty
        @name = N''' + ep.name + N''',
        @level0type = N''SCHEMA'',
        @level0name = N''' + OBJECT_SCHEMA_NAME(ep.major_id) + N''',
        @level1type = N''TABLE'',
        @level1name = N''' + OBJECT_NAME(ep.major_id) + N''',
        @level2type = N''COLUMN'',
        @level2name = N''' + c.name + N''';'
      FROM sys.extended_properties ep
      JOIN sys.columns c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
      WHERE ep.class = 1;
      EXEC sp_executesql @SQL;
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

    console.log(
      "All tables and extended properties have been dropped successfully"
    );
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    await sequelize.close();
  }
}

dropAllTables();
