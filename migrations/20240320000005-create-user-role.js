"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserRoles", {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
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
    await queryInterface.addConstraint("UserRoles", {
      fields: ["userId", "roleId"],
      type: "primary key",
      name: "user_role_pkey",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserRoles");
  },
};
