require("dotenv").config();

module.exports = {
  // JWT 配置
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
  jwtExpiration: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",

  // 密码加密配置
  saltRounds: 10,
};
