"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "药品名称",
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "药品编码/国药准字等",
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "分类id，关联category表",
      },
      brand_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "品牌id，关联category表",
      },
      dosage_form_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "剂型id，关联category表",
      },
      specification: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "规格",
      },
      manufacturer: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "生产厂家",
      },
      approval_number: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "批准文号/国药准字",
      },
      bar_code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "条形码",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "零售价",
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "库存数量",
      },
      unit_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "单位id，关联category表",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "说明书/描述",
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "图片",
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "上下架状态 1上架 0下架",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("products");
  },
};
