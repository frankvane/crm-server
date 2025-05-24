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
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isIn: [[0, 1]],
        },
      },
    },
    {
      tableName: "roles",
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: {
        model: "user_roles",
        unique: false,
      },
      foreignKey: "roleId",
      otherKey: "userId",
      as: "users",
    });

    Role.belongsToMany(models.Permission, {
      through: {
        model: "role_permissions",
        unique: false,
      },
      foreignKey: "roleId",
      otherKey: "permissionId",
      as: "permissions",
    });

    Role.belongsToMany(models.Resource, {
      through: {
        model: "role_resources",
        unique: false,
      },
      foreignKey: "roleId",
      otherKey: "resourceId",
      as: "resources",
    });
  };

  return Role;
};
