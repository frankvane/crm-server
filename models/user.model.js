const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * User 模型
 *
 * ⚠️ 重要提示：密码处理机制
 * ------------------------------
 * 1. 密码加密由模型的 hooks (beforeCreate 和 beforeUpdate) 自动处理
 * 2. 创建或更新用户时，请传入原始密码，不要手动加密
 * 3. 错误示例：
 *    ❌ await User.create({ password: await bcrypt.hash("password", 10) })
 * 4. 正确示例：
 *    ✅ await User.create({ password: "password" })
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        /**
         * ⚠️ 注意：密码字段会自动加密
         * 不要在外部手动加密密码，这会导致双重加密
         */
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isIn: [[0, 1]],
        },
      },
    },
    {
      tableName: "users",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["username"],
        },
      ],
    }
  );

  // 密码加密钩子
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: {
        model: "UserRoles",
        unique: false,
      },
      foreignKey: "userId",
      otherKey: "roleId",
      as: "roles",
    });

    User.hasMany(models.RefreshToken, {
      foreignKey: "userId",
      as: "refreshTokens",
    });
  };

  return User;
};
