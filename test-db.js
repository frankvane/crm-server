const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("crm", "sa", "chinavane", {
  host: "localhost",
  port: 1433,
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      validateBulkLoadParameters: true,
      rowCollectionOnDone: true,
      useUTC: false,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
  },
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();
