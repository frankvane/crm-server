const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Permission = sequelize.define(
    "Permission",
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
      actionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "关联的操作ID",
        references: {
          model: "ResourceActions",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "关联的资源ID",
        references: {
          model: "Resources",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
    },
    {
      tableName: "permissions",
    }
  );

  Permission.associate = (models) => {
    // 与资源的多对一关系
    Permission.belongsTo(models.Resource, {
      foreignKey: "resourceId",
      as: "resource",
    });

    // 与操作的一对一关系
    Permission.belongsTo(models.ResourceAction, {
      foreignKey: "actionId",
      as: "action",
    });

    // 与角色的多对多关系
    Permission.belongsToMany(models.Role, {
      through: {
        model: "RolePermissions",
        unique: false,
      },
      foreignKey: "permissionId",
      otherKey: "roleId",
      as: "roles",
    });
  };

  return Permission;
};
