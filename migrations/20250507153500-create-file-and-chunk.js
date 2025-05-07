"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("files", {
      file_id: { type: Sequelize.STRING, primaryKey: true },
      file_name: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.BIGINT, allowNull: false },
      user_id: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, // 0上传中，1已完成，2失败
      md5: { type: Sequelize.STRING, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.createTable("file_chunks", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      file_id: { type: Sequelize.STRING, allowNull: false },
      chunk_index: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, // 0上传中，1已完成
      user_id: { type: Sequelize.STRING, allowNull: false },
      upload_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
    // 判断索引是否存在再添加
    const [indexes] = await queryInterface.sequelize.query(
      `SELECT name FROM sys.indexes WHERE object_id = OBJECT_ID('file_chunks') AND name = 'file_chunks_file_id_chunk_index'`
    );
    if (!indexes.length) {
      await queryInterface.addIndex("file_chunks", ["file_id", "chunk_index"], {
        unique: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("file_chunks");
    await queryInterface.dropTable("files");
  },
};
