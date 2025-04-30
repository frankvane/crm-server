const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResourceAction = sequelize.define("ResourceAction", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "操作名称，如'添加'、'编辑'",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "操作代码，如'add'、'edit'、'get'",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "操作描述",
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "操作图标",
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "排序",
    },
    needConfirm: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否需要二次确认",
    },
    confirmMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "确认提示信息",
    },
  });

  return ResourceAction;
};
