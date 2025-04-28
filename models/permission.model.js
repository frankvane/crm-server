module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Permission", {
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    resource: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.STRING,
  });
};
