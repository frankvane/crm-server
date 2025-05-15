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
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "分类id，关联category表",
      },
      file_ext: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "文件后缀，如jpg、pdf等",
      },
      file_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "文件类型，如image、video、document等",
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "文件存储路径",
      },
      thumbnail_path: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "缩略图路径",
      },
    },
    {
      tableName: "files",
      timestamps: true,
    }
  );
  return File;
};
