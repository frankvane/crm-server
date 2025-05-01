const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResourceAction = sequelize.define(
    "ResourceAction",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sort: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      needConfirm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      confirmMessage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Resources",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
    },
    {
      tableName: "resourceactions",
    }
  );

  ResourceAction.associate = (models) => {
    // 与资源的多对一关系
    ResourceAction.belongsTo(models.Resource, {
      foreignKey: "resourceId",
      as: "resource",
    });

    // 与权限的一对一关系
    ResourceAction.hasOne(models.Permission, {
      foreignKey: "actionId",
      as: "permission",
    });
  };

  return ResourceAction;
};
