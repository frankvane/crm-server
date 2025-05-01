const jwt = require("jsonwebtoken");
const config = require("../config/auth");

// 生成访问令牌
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    roles:
      user.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions?.map((p) => p.name) || [],
      })) || [],
  };

  if (!config.jwt.secret) {
    console.error("JWT secret is not defined in configuration!");
  }

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiration,
  });
};

// 生成刷新令牌
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };

  if (!config.jwt.refreshSecret) {
    console.error("JWT refresh token secret is not defined in configuration!");
  }

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpiration,
  });
};

// 验证访问令牌
const verifyAccessToken = (token) => {
  try {
    if (!config.jwt.secret) {
      console.error("JWT secret is not defined in configuration!");
    }

    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error("JWT Token verification failed:", error.message);
    throw error;
  }
};

// 验证刷新令牌
const verifyRefreshToken = (token) => {
  try {
    if (!config.jwt.refreshSecret) {
      console.error(
        "JWT refresh token secret is not defined in configuration!"
      );
    }

    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    console.error("JWT Refresh Token verification failed:", error.message);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
