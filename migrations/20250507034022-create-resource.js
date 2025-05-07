"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("resources", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      path: { type: Sequelize.STRING, allowNull: true },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "resources", key: "id" },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      component: { type: Sequelize.STRING, allowNull: true },
      icon: { type: Sequelize.STRING, allowNull: true },
      sort: { type: Sequelize.INTEGER, defaultValue: 0 },
      hidden: { type: Sequelize.BOOLEAN, defaultValue: false },
      redirect: { type: Sequelize.STRING, allowNull: true },
      alwaysShow: { type: Sequelize.BOOLEAN, defaultValue: false },
      meta: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("resources");
  },
};
