const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "产品id，关联product表",
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "用户id，关联user表",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "评论内容",
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "评分（1-5星）",
      },
      parent_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "父评论id，支持楼中楼/回复",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "状态 1正常 0隐藏/删除",
      },
    },
    {
      tableName: "comments",
      timestamps: true,
    }
  );
  return Comment;
};
