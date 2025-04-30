const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Resource = sequelize.define("Resource", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
      comment: "资源代码",
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "前端路由路径",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "父级资源ID",
    },
    component: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "前端组件路径",
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "图标标识",
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "排序",
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否隐藏",
    },
    redirect: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "重定向路径",
    },
    alwaysShow: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "是否总是显示",
    },
    meta: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "额外元数据",
      defaultValue: JSON.stringify({
        title: "",
        icon: "",
        noCache: false,
        link: null,
      }),
      get() {
        const rawValue = this.getDataValue("meta");
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue("meta", JSON.stringify(value));
      },
    },
  });

  Resource.associate = (models) => {
    // 自关联（树形结构）
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
      through: "RoleResource",
      foreignKey: "resourceId",
      otherKey: "roleId",
      as: "roles",
    });
  };

  return Resource;
};
