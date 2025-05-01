"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RoleResources", {
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

    // Add a composite primary key
    await queryInterface.addConstraint("RoleResources", {
      fields: ["roleId", "resourceId"],
      type: "primary key",
      name: "role_resource_pkey",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RoleResources");
  },
};
