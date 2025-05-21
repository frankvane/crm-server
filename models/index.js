const { Sequelize } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(config);

// 导入模型定义
const User = require("./user.model")(sequelize);
const Role = require("./role.model")(sequelize);
const Permission = require("./permission.model")(sequelize);
const Resource = require("./resource.model")(sequelize);
const ResourceAction = require("./resourceAction.model")(sequelize);
const RoleResource = require("./roleResource.model")(sequelize);
const RefreshToken = require("./refreshToken.model")(sequelize);
const Category = require("./category.model")(sequelize);
const CategoryType = require("./categoryType.model")(sequelize);
const File = require("./file.model")(sequelize);
const FileChunk = require("./fileChunk.model")(sequelize);
const Product = require("./product.model")(sequelize);
const Comment = require("./comment.model")(sequelize);
const Patient = require("./patient.model")(sequelize);
const MedicalRecord = require("./medicalRecord.model")(sequelize);

// 统一调用 associate 方法
const models = {
  sequelize,
  User,
  Role,
  Permission,
  Resource,
  ResourceAction,
  RoleResource,
  RefreshToken,
  Category,
  CategoryType,
  File,
  FileChunk,
  Product,
  Comment,
  Patient,
  MedicalRecord,
};

// 建立关联关系
Object.values(models).forEach((model) => {
  if (model && typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = models;
