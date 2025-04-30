const request = require("supertest");
const app = require("../../app");
const { generateUserData } = require("../helpers");

describe("Auth Controller", () => {
  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const userData = generateUserData();

      // 先创建用户
      await request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(userData);

      // 测试登录
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({
          username: userData.username,
          password: userData.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should return 401 with incorrect password", async () => {
      const userData = generateUserData();

      // 先创建用户
      await request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(userData);

      // 使用错误密码登录
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({
          username: userData.username,
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("用户名或密码不正确");
    });

    it("should return 401 with non-existent username", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({
          username: "nonexistentuser",
          password: "password123",
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("用户名或密码不正确");
    });
  });
});
