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
      through: "UserRole",
      as: "Users",
    });

    Role.belongsToMany(models.Permission, {
      through: "RolePermission",
      as: "Permissions",
    });
  };

  return Role;
};
