"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("categories", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      code: { type: Sequelize.STRING, allowNull: false },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: { model: "categories", key: "id" },
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "category_types", key: "id" },
      },
      description: { type: Sequelize.STRING, allowNull: true },
      sort: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("categories", ["code", "typeId"], {
      unique: true,
      name: "uk_code_type",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("categories");
  },
};
