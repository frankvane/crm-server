const jwt = require("../utils/jwt");
const ResponseUtil = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json(ResponseUtil.error("No token provided", 401));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json(ResponseUtil.error("Invalid token format", 401));
    }

    try {
      const decoded = jwt.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json(ResponseUtil.error("Token expired", 401));
      }
      return res.status(401).json(ResponseUtil.error("Invalid token", 401));
    }
  } catch (err) {
    next(err);
  }
};
