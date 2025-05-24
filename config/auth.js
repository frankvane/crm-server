require("dotenv").config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  password: {
    saltRounds: 10,
  },
};
