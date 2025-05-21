"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("medical_records", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "病患ID，关联patients表",
      },
      visit_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "就诊日期",
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "诊断结果",
      },
      treatment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "治疗方案",
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
        comment: "状态 1有效 0无效",
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
    await queryInterface.dropTable("medical_records");
  },
}; 