const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoleResource = sequelize.define(
    "RoleResource",
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Resources",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    }
  );

  return RoleResource;
};
