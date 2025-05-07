"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permissions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: true },
      actionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "resource_actions", key: "id" },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
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
    await queryInterface.dropTable("permissions");
  },
};
