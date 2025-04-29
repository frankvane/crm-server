const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "分类名称",
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "分类编码",
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: "父级分类ID",
      },
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "分类类型ID",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "分类描述",
      },
      sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "排序号",
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
          fields: ["code", "typeId"],
          name: "uk_code_type",
        },
      ],
    }
  );

  Category.associate = (models) => {
    // 自关联（父子关系）
    Category.belongsTo(Category, {
      foreignKey: "parentId",
      as: "parent",
    });
    Category.hasMany(Category, {
      foreignKey: "parentId",
      as: "children",
    });

    // 与分类类型的关联
    Category.belongsTo(models.CategoryType, {
      foreignKey: "typeId",
      as: "type",
    });
  };

  return Category;
};
