const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FileChunk = sequelize.define(
    "FileChunk",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      file_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chunk_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0上传中，1已完成
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      upload_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      chunk_md5: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '分片MD5',
      },
    },
    {
      tableName: "file_chunks",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["file_id", "chunk_index"],
        },
      ],
    }
  );
  return FileChunk;
};
