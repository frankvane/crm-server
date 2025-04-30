const request = require("supertest");
const app = require("../app");
const { getTestUserToken } = require("./setup");

describe("Auth Module", () => {
  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
    });

    it("should fail with non-existent user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
    });
  });

  describe("GET /api/auth/info", () => {
    it("should get user info with valid token", async () => {
      const token = await getTestUserToken();

      const response = await request(app)
        .get("/api/auth/info")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("username");
      expect(response.body.data).toHaveProperty("roles");
      expect(response.body.data).toHaveProperty("permissions");
      expect(response.body.data).toHaveProperty("routes");
    });

    it("should fail without token", async () => {
      const response = await request(app).get("/api/auth/info");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/info")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
    });
  });
});
