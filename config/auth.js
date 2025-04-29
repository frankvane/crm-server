require("dotenv").config();

module.exports = {
  // JWT 配置
  jwtSecret: process.env.JWT_SECRET || "your-jwt-secret",
  jwtExpiration: process.env.JWT_EXPIRATION || "1h", // 1小时

  // 刷新令牌配置
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret",
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || "7d", // 7天

  // 密码加密配置
  saltRounds: 10,
};
