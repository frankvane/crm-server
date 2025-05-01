const { expect } = require("chai");
const bcrypt = require("bcryptjs");
const { User } = require("../../models");
const { sequelize } = require("../../models");

describe("User Model Password Handling", () => {
  before(async () => {
    // 在所有测试前同步数据库
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // 在每个测试前清空用户表
    await User.destroy({ where: {} });
  });

  it("should automatically encrypt password when creating a user", async () => {
    const plainPassword = "testPassword123";
    const user = await User.create({
      username: "testuser",
      password: plainPassword,
      email: "test@example.com",
    });

    // 验证密码已被加密
    expect(user.password).to.not.equal(plainPassword);
    // 验证加密后的密码可以正确验证
    const isValid = await bcrypt.compare(plainPassword, user.password);
    expect(isValid).to.be.true;
  });

  it("should automatically encrypt password when updating user password", async () => {
    // 创建用户
    const user = await User.create({
      username: "testuser",
      password: "originalPassword",
      email: "test@example.com",
    });

    const newPassword = "newPassword123";
    user.password = newPassword;
    await user.save();

    // 验证新密码已被加密
    expect(user.password).to.not.equal(newPassword);
    // 验证新密码可以正确验证
    const isValid = await bcrypt.compare(newPassword, user.password);
    expect(isValid).to.be.true;
  });

  it("should not double encrypt password when manually hashed", async () => {
    const plainPassword = "testPassword123";
    const manuallyHashedPassword = await bcrypt.hash(plainPassword, 10);

    // 创建用户时使用手动加密的密码（错误做法）
    const user = await User.create({
      username: "testuser",
      password: manuallyHashedPassword,
      email: "test@example.com",
    });

    // 验证密码被二次加密
    const isValid = await bcrypt.compare(plainPassword, user.password);
    expect(isValid).to.be.false;
  });

  it("should handle bulk create with plain passwords", async () => {
    const users = await User.bulkCreate([
      {
        username: "user1",
        password: "password1",
        email: "user1@example.com",
      },
      {
        username: "user2",
        password: "password2",
        email: "user2@example.com",
      },
    ]);

    // 验证所有用户的密码都被正确加密
    for (const user of users) {
      const plainPassword =
        user.username === "user1" ? "password1" : "password2";
      const isValid = await bcrypt.compare(plainPassword, user.password);
      expect(isValid).to.be.true;
    }
  });

  it("should not modify password if it hasn't changed during update", async () => {
    // 创建用户
    const user = await User.create({
      username: "testuser",
      password: "originalPassword",
      email: "test@example.com",
    });

    const originalHash = user.password;

    // 更新用户名但不更新密码
    user.username = "newusername";
    await user.save();

    // 验证密码哈希没有改变
    expect(user.password).to.equal(originalHash);
  });
});
