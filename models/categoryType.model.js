const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CategoryType = sequelize.define(
    "CategoryType",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment:
          "分类类型名称，如：menu（菜单）、product（产品）、article（文章）",
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "分类类型编码，用于程序中标识不同类型",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "分类类型描述",
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "状态：true-启用，false-禁用",
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["code"],
        },
      ],
    }
  );

  CategoryType.associate = (models) => {
    CategoryType.hasMany(models.Category, {
      foreignKey: "typeId",
      as: "categories",
    });
  };

  return CategoryType;
};
