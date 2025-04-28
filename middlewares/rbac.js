const rbacService = require("../services/rbac.service");

module.exports = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const hasPermission = await rbacService.checkPermission(
        req.user.id,
        requiredPermission
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("RBAC Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
