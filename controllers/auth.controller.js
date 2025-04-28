const authService = require("../services/auth.service");
const { RefreshToken, TokenBlacklist } = require("../models");
const jwt = require("../utils/jwt");

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const tokens = await authService.login(username, password);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error("No refresh token");
    const payload = jwt.verifyRefreshToken(refreshToken);
    const tokenInDb = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    if (!tokenInDb) throw new Error("Invalid refresh token");
    const accessToken = jwt.signAccessToken({
      id: payload.id,
      username: payload.username,
    });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error("No refresh token");
    await TokenBlacklist.create({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await RefreshToken.destroy({ where: { token: refreshToken } });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
