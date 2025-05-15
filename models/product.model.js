const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "药品名称",
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "药品编码/国药准字等",
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "分类id，关联category表",
      },
      brand_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "品牌id，关联category表",
      },
      dosage_form_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "剂型id，关联category表",
      },
      specification: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "规格",
      },
      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "生产厂家",
      },
      approval_number: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "批准文号/国药准字",
      },
      bar_code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "条形码",
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "零售价",
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "库存数量",
      },
      unit_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "单位id，关联category表",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "说明书/描述",
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "图片",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "上下架状态 1上架 0下架",
      },
    },
    {
      tableName: "products",
      timestamps: true,
    }
  );
  return Product;
};
