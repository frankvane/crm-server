const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Permission = sequelize.define("Permission", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: "RolePermission",
      as: "Roles",
    });
  };

  return Permission;
};
