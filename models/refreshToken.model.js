module.exports = (sequelize, DataTypes) => {
  return sequelize.define("RefreshToken", {
    token: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  });
};
