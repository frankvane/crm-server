"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Resources", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Resources",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      component: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      redirect: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      alwaysShow: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      meta: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("Resources");
  },
};
