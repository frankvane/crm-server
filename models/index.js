const Sequelize = require("sequelize");
const dbConfig = require("../config/database");
const sequelize = new Sequelize(dbConfig);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.model")(sequelize, Sequelize.DataTypes);
db.Role = require("./role.model")(sequelize, Sequelize.DataTypes);
db.Permission = require("./permission.model")(sequelize, Sequelize.DataTypes);
db.Category = require("./category.model")(sequelize, Sequelize.DataTypes);
db.RefreshToken = require("./refreshToken.model")(
  sequelize,
  Sequelize.DataTypes
);
db.TokenBlacklist = require("./tokenBlacklist.model")(
  sequelize,
  Sequelize.DataTypes
);

db.User.belongsToMany(db.Role, { through: "UserRole" });
db.Role.belongsToMany(db.User, { through: "UserRole" });
db.Role.belongsToMany(db.Permission, { through: "RolePermission" });
db.Permission.belongsToMany(db.Role, { through: "RolePermission" });

db.Category.hasMany(db.Category, { as: "children", foreignKey: "parentId" });
db.Category.belongsTo(db.Category, { as: "parent", foreignKey: "parentId" });

module.exports = db;
