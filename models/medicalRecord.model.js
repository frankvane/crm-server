const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MedicalRecord = sequelize.define(
    "MedicalRecord",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      patient_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "病患ID，关联patients表",
      },
      visit_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "就诊日期",
      },
      diagnosis: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "诊断结果",
      },
      treatment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "治疗方案",
      },
      doctor: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "主治医师",
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "备注",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "状态 1有效 0无效",
      },
    },
    {
      tableName: "medical_records",
      timestamps: true,
    }
  );
  return MedicalRecord;
}; 