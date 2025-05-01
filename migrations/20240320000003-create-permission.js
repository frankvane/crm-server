"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Permissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionId: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "关联的资源ID",
        references: {
          model: "Resources",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Permissions");
  },
};
