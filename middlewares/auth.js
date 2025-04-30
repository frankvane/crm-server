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
      console.log("auth step 1");
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
  console.log("hasPermission", permission);
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // 获取用户及其角色和权限
      const user = await User.findByPk(userId, {
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
        return res.status(403).json(ResponseUtil.error("User not found", 403));
      }

      // 检查用户的所有角色中是否有所需权限
      const hasRequiredPermission = user.roles.some((role) =>
        role.Permissions.some((p) => p.name === permission)
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
