const { sequelize } = require("../models");

async function checkDatabase() {
  try {
    // 检查 Permissions 表
    const permissions = await sequelize.query("SELECT * FROM Permissions", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("Permissions:", permissions);

    // 检查 Roles 表
    const roles = await sequelize.query("SELECT * FROM Roles", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("Roles:", roles);

    // 检查 Users 表
    const users = await sequelize.query("SELECT * FROM Users", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("Users:", users);

    // 检查 RolePermissions 表
    const rolePermissions = await sequelize.query(
      "SELECT * FROM RolePermissions",
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log("RolePermissions:", rolePermissions);

    // 检查 UserRoles 表
    const userRoles = await sequelize.query("SELECT * FROM UserRoles", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("UserRoles:", userRoles);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
