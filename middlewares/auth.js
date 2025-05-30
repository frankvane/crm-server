const jwt = require("../utils/jwt");
const { User, Role, Permission } = require("../models");
const ResponseUtil = require("../utils/response");

const verifyToken = async (req, res, next) => {
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

const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // 获取用户及其角色和权限
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles", // 使用小写，与模型定义保持一致
            include: [
              {
                model: Permission,
                as: "permissions", // 使用小写，与模型定义保持一致
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(403).json(ResponseUtil.error("User not found", 403));
      }

      // 打印当前用户所有权限名和所需permission参数
      // console.log(
      //   "用户所有权限:",
      //   user.roles.flatMap((role) => role.permissions.map((p) => p.name))
      // );
      // console.log("需要的权限:", permission);
      const hasRequiredPermission = user.roles.some(
        (role) => role.permissions.some((p) => p.name === permission) // 使用小写，与上面定义的别名保持一致
      );

      if (!hasRequiredPermission) {
        return res
          .status(403)
          .json(ResponseUtil.error("Permission denied", 403));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  verifyToken,
  hasPermission,
};
