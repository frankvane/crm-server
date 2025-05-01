const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

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
