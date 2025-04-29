const request = require("supertest");
const app = require("../../app");
const { sequelize, User, Role, Permission } = require("../../models");
const createInitialData = require("../../seeders/init");

describe("Authentication API", () => {
  let server;

  beforeAll(async () => {
    // 同步数据库并创建初始数据
    await sequelize.sync({ force: true });
    await createInitialData();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data.user).toHaveProperty("Roles");
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.message).toBe("Invalid password");
    });

    it("should fail with non-existent user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refreshToken;

    beforeAll(async () => {
      // 先登录获取 refreshToken
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });
      refreshToken = response.body.data.refreshToken;
    });

    it("should refresh token successfully", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe("Token refreshed successfully");
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.message).toBe("Invalid refresh token");
    });
  });

  describe("POST /api/auth/logout", () => {
    let refreshToken;

    beforeAll(async () => {
      // 先登录获取 refreshToken
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });
      refreshToken = response.body.data.refreshToken;
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.message).toBe("No refresh token provided");
    });
  });
});
