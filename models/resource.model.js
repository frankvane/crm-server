const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Resource = sequelize.define(
    "Resource",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Resources",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      component: {
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
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      redirect: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alwaysShow: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      meta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "resources",
    }
  );

  Resource.associate = (models) => {
    // 自引用关系（父子菜单）
    Resource.belongsTo(Resource, {
      foreignKey: "parentId",
      as: "parent",
    });
    Resource.hasMany(Resource, {
      foreignKey: "parentId",
      as: "children",
    });

    // 与角色的多对多关系
    Resource.belongsToMany(models.Role, {
      through: {
        model: "RoleResources",
        unique: false,
      },
      foreignKey: "resourceId",
      otherKey: "roleId",
      as: "roles",
    });

    // 与权限的一对多关系
    Resource.hasMany(models.Permission, {
      foreignKey: "resourceId",
      as: "permissions",
    });

    // 与资源操作的一对多关系
    Resource.hasMany(models.ResourceAction, {
      foreignKey: "resourceId",
      as: "actions",
    });
  };

  return Resource;
};
