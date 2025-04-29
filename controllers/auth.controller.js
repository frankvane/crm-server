const { User, Role, Permission, RefreshToken } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth");
const ResponseUtil = require("../utils/response");

// 用户登录
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: "Roles",
          include: [
            {
              model: Permission,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(401).json(ResponseUtil.error("User not found", 401));
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(ResponseUtil.error("Invalid password", 401));
    }

    // 生成访问令牌和刷新令牌
    const accessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.accessTokenExpiry,
    });

    const refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, {
      expiresIn: config.refreshTokenExpiry,
    });

    // 保存刷新令牌
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + config.refreshTokenExpiry * 1000),
    });

    // 准备用户数据（排除密码）
    const userData = user.toJSON();
    delete userData.password;

    res.json(
      ResponseUtil.success(
        {
          user: userData,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
  } catch (err) {
    next(err);
  }
};

// 刷新令牌
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json(ResponseUtil.error("No refresh token provided", 401));
    }

    // 验证刷新令牌
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res
        .status(401)
        .json(ResponseUtil.error("Invalid refresh token", 401));
    }

    if (new Date() > storedToken.expiresAt) {
      await storedToken.destroy();
      return res
        .status(401)
        .json(ResponseUtil.error("Refresh token expired", 401));
    }

    // 验证并解码令牌
    const decoded = jwt.verify(refreshToken, config.refreshSecret);

    // 生成新的访问令牌
    const accessToken = jwt.sign({ id: decoded.id }, config.secret, {
      expiresIn: config.accessTokenExpiry,
    });

    res.json(
      ResponseUtil.success({ accessToken }, "Token refreshed successfully")
    );
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(ResponseUtil.error("Invalid refresh token", 401));
    }
    next(err);
  }
};

// 注销登录
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json(ResponseUtil.error("No refresh token provided", 401));
    }

    // 删除刷新令牌
    await RefreshToken.destroy({
      where: { token: refreshToken },
    });

    res.json(ResponseUtil.success(null, "Logged out successfully"));
  } catch (err) {
    next(err);
  }
};
