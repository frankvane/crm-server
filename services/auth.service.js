const bcrypt = require("bcryptjs");
const { User, RefreshToken } = require("../models");
const jwt = require("../utils/jwt");

exports.login = async (username, password) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new Error("User not found");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");
  const accessToken = jwt.signAccessToken({
    id: user.id,
    username: user.username,
  });
  const refreshToken = jwt.signRefreshToken({
    id: user.id,
    username: user.username,
  });
  await RefreshToken.create({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    UserId: user.id,
  });
  return { accessToken, refreshToken };
};
