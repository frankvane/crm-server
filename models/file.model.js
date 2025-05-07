const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const File = sequelize.define(
    "File",
    {
      file_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0上传中，1已完成，2失败
      },
      md5: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "files",
      timestamps: true,
    }
  );
  return File;
};
