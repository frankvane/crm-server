"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 先检查表是否存在
    const tableExists = await queryInterface.sequelize.query(
      "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ResourceActions'"
    );

    if (!tableExists[0].length) {
      await queryInterface.createTable("ResourceActions", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: '操作名称，如"添加"、"编辑"',
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: '操作代码，如"add"、"edit"、"get"',
          unique: true,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: "操作描述",
        },
        icon: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: "操作图标",
        },
        sort: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: "排序",
        },
        needConfirm: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: "是否需要二次确认",
        },
        confirmMessage: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: "确认提示信息",
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

      // 添加唯一索引，确保同一资源下操作代码不重复
      await queryInterface.addIndex("ResourceActions", ["resourceId", "code"], {
        unique: true,
        name: "resource_action_unique",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ResourceActions");
  },
};
