const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoleResource = sequelize.define(
    "RoleResource",
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "resources",
          key: "id",
        },
      },
    },
    {
      tableName: "user_roles",
      timestamps: true,
    }
  );

  return RoleResource;
};
