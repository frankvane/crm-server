const bcrypt = require("bcryptjs");
const { User, Role, Permission, RefreshToken } = require("../models");
const jwt = require("../utils/jwt");
const ResponseUtil = require("../utils/response");
const config = require("../config/auth");

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
          include: [{ model: Permission }],
        },
      ],
    });

    // 验证用户是否存在
    if (!user) {
      return res.status(401).json(ResponseUtil.error("User not found", 401));
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(ResponseUtil.error("Invalid password", 401));
    }

    // 生成令牌
    const accessToken = jwt.generateAccessToken(user);
    const refreshToken = jwt.generateRefreshToken(user);

    // 计算刷新令牌过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    // 保存刷新令牌
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: expiresAt,
    });

    // 返回令牌和用户信息（不包含密码）
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      roles: user.Roles,
    };

    res.json(
      ResponseUtil.success(
        {
          user: userWithoutPassword,
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
    const tokenDoc = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [
        {
          model: User,
          include: [{ model: Role }],
        },
      ],
    });

    if (!tokenDoc) {
      return res
        .status(401)
        .json(ResponseUtil.error("Invalid refresh token", 401));
    }

    // 生成新的访问令牌
    const accessToken = jwt.generateAccessToken(tokenDoc.User);

    res.json(
      ResponseUtil.success({ accessToken }, "Token refreshed successfully")
    );
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
