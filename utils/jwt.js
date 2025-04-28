const jwt = require("jsonwebtoken");
const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

exports.signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

exports.signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

exports.verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

exports.verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);
