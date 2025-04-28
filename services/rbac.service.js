const { User, Role, Permission } = require("../models");

class RBACService {
  async checkPermission(userId, requiredPermission) {
    try {
      // 获取用户及其角色和权限
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            include: [
              {
                model: Permission,
              },
            ],
          },
        ],
      });

      if (!user) {
        return false;
      }

      // 检查用户的所有角色中是否有包含所需权限的
      return user.Roles.some((role) =>
        role.Permissions.some(
          (permission) => permission.name === requiredPermission
        )
      );
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }
}

module.exports = new RBACService();
