"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("patients", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "姓名",
      },
      gender: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "性别 0女 1男",
      },
      birthday: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "出生日期",
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "手机号",
      },
      id_card: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "身份证号",
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "家庭住址",
      },
      emergency_contact: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "紧急联系人姓名",
      },
      emergency_phone: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "紧急联系人手机号",
      },
      doctor: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "主治医师",
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "备注",
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "状态 1正常 0禁用",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("patients");
  },
}; 