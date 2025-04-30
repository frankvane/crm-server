const { User, Role, Permission, RefreshToken } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt"); // Use our custom JWT utility instead
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
          as: "roles",
          include: [
            {
              model: Permission,
              as: "Permissions",
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

    // 使用我们的 JWT 工具类生成令牌
    const accessToken = jwt.generateAccessToken(user);
    const refreshToken = jwt.generateRefreshToken(user);

    // 保存刷新令牌
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.json(
      ResponseUtil.success(
        {
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

    try {
      // 验证并解码令牌
      const decoded = jwt.verifyRefreshToken(refreshToken);

      // 获取用户信息
      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Role,
            as: "roles",
            include: [
              {
                model: Permission,
                as: "Permissions",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(401).json(ResponseUtil.error("User not found", 401));
      }

      // 生成新的访问令牌
      const accessToken = jwt.generateAccessToken(user);

      res.json(
        ResponseUtil.success({ accessToken }, "Token refreshed successfully")
      );
    } catch (jwtError) {
      return res
        .status(401)
        .json(ResponseUtil.error("Invalid refresh token", 401));
    }
  } catch (err) {
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
