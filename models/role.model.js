const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "roles",
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: {
        model: "UserRoles",
        unique: false,
      },
      foreignKey: "roleId",
      otherKey: "userId",
      as: "users",
    });

    Role.belongsToMany(models.Permission, {
      through: {
        model: "RolePermissions",
        unique: false,
      },
      foreignKey: "roleId",
      otherKey: "permissionId",
      as: "permissions",
    });

    Role.belongsToMany(models.Resource, {
      through: {
        model: "RoleResources",
        unique: false,
      },
      foreignKey: "roleId",
      otherKey: "resourceId",
      as: "resources",
    });
  };

  return Role;
};
