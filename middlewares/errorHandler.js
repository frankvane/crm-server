const ResponseUtil = require("../utils/response");

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // 处理 Sequelize 错误
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json(ResponseUtil.error(err.errors[0].message, 400));
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res
      .status(400)
      .json(ResponseUtil.error("Record already exists", 400));
  }

  // 处理 JWT 错误
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(ResponseUtil.error("Invalid token", 401));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(ResponseUtil.error("Token expired", 401));
  }

  // 默认错误处理
  res.status(500).json(ResponseUtil.error("Internal Server Error", 500));
};
