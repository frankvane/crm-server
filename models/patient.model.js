const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Patient = sequelize.define(
    "Patient",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "姓名",
      },
      gender: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "性别 0女 1男",
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "出生日期",
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "手机号",
      },
      id_card: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "身份证号",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "家庭住址",
      },
      emergency_contact: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "紧急联系人姓名",
      },
      emergency_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "紧急联系人手机号",
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
        comment: "状态 1正常 0禁用",
      },
    },
    {
      tableName: "patients",
      timestamps: true,
    }
  );
  return Patient;
}; 