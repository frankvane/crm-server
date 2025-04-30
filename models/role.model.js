const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define("Role", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: "UserRoles",
      foreignKey: "roleId",
      otherKey: "userId",
      as: "Users",
    });

    Role.belongsToMany(models.Permission, {
      through: "RolePermissions",
      foreignKey: "roleId",
      otherKey: "permissionId",
      as: "Permissions",
    });
  };

  return Role;
};
