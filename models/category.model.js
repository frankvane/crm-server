module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: { type: DataTypes.STRING, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    description: DataTypes.STRING,
  });
  return Category;
};
