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

  if (!config.jwtSecret) {
    console.error("JWT secret is not defined in configuration!");
  }

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

  if (!config.refreshTokenSecret) {
    console.error("JWT refresh token secret is not defined in configuration!");
  }

  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiration,
  });
};

// 验证访问令牌
const verifyAccessToken = (token) => {
  try {
    if (!config.jwtSecret) {
      console.error("JWT secret is not defined in configuration!");
    }

    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    console.error("JWT Token verification failed:", error.message);
    throw error;
  }
};

// 验证刷新令牌
const verifyRefreshToken = (token) => {
  try {
    if (!config.refreshTokenSecret) {
      console.error(
        "JWT refresh token secret is not defined in configuration!"
      );
    }

    return jwt.verify(token, config.refreshTokenSecret);
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
