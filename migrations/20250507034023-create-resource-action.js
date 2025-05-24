"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("resource_actions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: true },
      icon: { type: Sequelize.STRING, allowNull: true },
      sort: { type: Sequelize.INTEGER, defaultValue: 0 },
      needConfirm: { type: Sequelize.BOOLEAN, defaultValue: false },
      confirmMessage: { type: Sequelize.STRING, allowNull: true },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "resources", key: "id" },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("resource_actions");
  },
};
