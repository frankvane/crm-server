const { User, Role, Permission } = require("../models");

class RBACService {
  async checkPermission(userId, requiredPermission) {
    try {
      // 获取用户及其角色和权限
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles", // 添加明确的别名
            include: [
              {
                model: Permission,
                as: "permissions", // 添加明确的别名
              },
            ],
          },
        ],
      });

      if (!user) {
        return false;
      }

      // 检查用户的所有角色中是否有包含所需权限的
      return user.roles.some((role) =>
        role.permissions.some(
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
