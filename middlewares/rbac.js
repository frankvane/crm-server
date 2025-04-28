const rbacService = require("../services/rbac.service");
module.exports = (permissionName) => async (req, res, next) => {
  const userId = req.user.id;
  const hasPermission = await rbacService.checkPermission(
    userId,
    permissionName
  );
  if (!hasPermission) return res.status(403).json({ message: "Forbidden" });
  next();
};
