const jwt = require("jsonwebtoken");
const config = require("../config/auth");

// 生成访问令牌
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    roles:
      user.Roles?.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.Permissions?.map((p) => p.name) || [],
      })) || [],
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
};

// 生成刷新令牌
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };

  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiration,
  });
};

// 验证访问令牌
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

// 验证刷新令牌
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.refreshTokenSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
