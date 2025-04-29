const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // 如果错误已经有状态码，使用它，否则使用500
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    code: statusCode,
    message: message,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
