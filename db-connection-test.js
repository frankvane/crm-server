const sql = require("mssql");

// 配置连接信息
const config = {
  user: "sa",
  password: "chinavane",
  server: "localhost", // 或你的服务器IP/名称
  database: "crm", // 默认连接master数据库
  port: 1433,
  options: {
    encrypt: false, // 如果使用Azure SQL需要设为true
    trustServerCertificate: true, // 本地开发环境可以设为true
  },
};

async function testConnection() {
  try {
    // 建立连接
    await sql.connect(config);
    console.log("连接SQL Server成功!");

    // 执行一个简单查询
    const result = await sql.query`SELECT @@VERSION AS 'SQL Server Version'`;
    console.log("SQL Server版本:", result.recordset[0]["SQL Server Version"]);
  } catch (err) {
    console.error("连接失败:", err);
  } finally {
    // 关闭连接
    sql.close();
  }
}

// 执行测试
testConnection();
