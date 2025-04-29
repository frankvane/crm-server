require("dotenv").config();

module.exports = {
  // JWT 配置
  secret: process.env.JWT_SECRET || "your-secret-key",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
  accessTokenExpiry: parseInt(process.env.JWT_EXPIRY) || 3600, // 1小时
  refreshTokenExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY) || 604800, // 7天

  // 密码加密配置
  saltRounds: 10,
};
