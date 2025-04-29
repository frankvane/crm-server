const { Sequelize } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(config);

// 导入模型定义
const User = require("./user.model")(sequelize);
const Role = require("./role.model")(sequelize);
const Permission = require("./permission.model")(sequelize);
const RefreshToken = require("./refreshToken.model")(sequelize);
const Category = require("./category.model")(sequelize);
const CategoryType = require("./categoryType.model")(sequelize);

// 建立模型关联
User.associate({ Role, RefreshToken });
Role.associate({ User, Permission });
Permission.associate({ Role });
RefreshToken.associate({ User });
Category.associate({ CategoryType });
CategoryType.associate({ Category });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RefreshToken,
  Category,
  CategoryType,
};
