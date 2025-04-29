const { User, Role, Permission } = require("../models");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId, {
        include: [
          {
            model: Role,
            include: [Permission],
          },
        ],
      });

      if (!user) {
        return res.status(403).json({
          code: 403,
          message: "User not found",
          data: null,
        });
      }

      const hasPermission = user.Roles.some((role) =>
        role.Permissions.some(
          (permission) => permission.name === requiredPermission
        )
      );

      if (!hasPermission) {
        return res.status(403).json({
          code: 403,
          message: "Permission denied",
          data: null,
        });
      }

      next();
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({
        code: 500,
        message: "Internal server error",
        data: null,
      });
    }
  };
};

const rbac = {
  checkPermission,
};

module.exports = rbac;
