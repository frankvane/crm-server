"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comments", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "产品id，关联product表",
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "用户id，关联user表",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "评论内容",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "评分（1-5星）",
      },
      parent_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "父评论id，支持楼中楼/回复",
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "状态 1正常 0隐藏/删除",
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
    await queryInterface.dropTable("comments");
  },
};
