// 权限前缀配置
const PERMISSION_PREFIXES = {
  // 基础操作权限
  CRUD: ["create_", "view_", "update_", "delete_"],
  // 管理权限
  MANAGE: ["manage_"],
  // 其他权限前缀可以在这里添加
};

// 权限类型配置
const PERMISSION_TYPES = {
  // 菜单权限
  MENU: "menu",
  // 按钮权限
  BUTTON: "button",
  // 接口权限
  API: "api",
};

// 权限验证规则
const PERMISSION_RULES = {
  // 验证权限名称是否合法
  isValidPermission: (permissionName) => {
    const allPrefixes = [
      ...PERMISSION_PREFIXES.CRUD,
      ...PERMISSION_PREFIXES.MANAGE,
    ];
    return allPrefixes.some((prefix) => permissionName.startsWith(prefix));
  },

  // 获取权限类型
  getPermissionType: (permissionName) => {
    if (permissionName.startsWith("manage_")) {
      return PERMISSION_TYPES.MENU;
    }
    return PERMISSION_TYPES.BUTTON;
  },
};

module.exports = {
  PERMISSION_PREFIXES,
  PERMISSION_TYPES,
  PERMISSION_RULES,
};
