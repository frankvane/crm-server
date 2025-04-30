const request = require("supertest");
const app = require("../../app");
const {
  getTestHeaders,
  generateUserData,
  getTestToken,
} = require("../helpers");

describe("User Controller", () => {
  let testToken;

  beforeEach(async () => {
    // 在每个测试前获取新的 token
    const userData = generateUserData();
    testToken = await getTestToken(userData);
  });

  describe("POST /api/users", () => {
    it("should create a new user when valid data is provided", async () => {
      const userData = generateUserData();

      const response = await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data).not.toHaveProperty("password"); // 确保返回数据中不包含密码
    });

    it("should return 400 when username already exists", async () => {
      const userData = generateUserData();

      // 先创建一个用户
      await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(userData);

      // 尝试创建相同用户名的用户
      const response = await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("用户名已存在");
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toContain("必填");
    });

    it("should create a new user", async () => {
      const userData = generateUserData();
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
    });

    it("should return 403 without token", async () => {
      const userData = generateUserData();
      const response = await request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(userData);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });

  describe("GET /api/users", () => {
    it("should return list of users with pagination", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${testToken}`)
        .query({ current: 1, pageSize: 10 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("list");
      expect(response.body.data).toHaveProperty("pagination");
      expect(response.body.data.pagination).toHaveProperty("current");
      expect(response.body.data.pagination).toHaveProperty("pageSize");
      expect(response.body.data.pagination).toHaveProperty("total");
    });

    it("should return 403 without token", async () => {
      const response = await request(app)
        .get("/api/users")
        .query({ current: 1, pageSize: 10 });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });

    it("should support search by username", async () => {
      // 先创建一个用户
      const userData = generateUserData({ username: "searchtest" });
      await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(userData);

      const response = await request(app)
        .get("/api/users")
        .query({ username: "searchtest" })
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(
        response.body.data.list.some((user) => user.username === "searchtest")
      ).toBe(true);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user when valid data is provided", async () => {
      // 先创建一个用户
      const createResponse = await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(generateUserData());

      const userId = createResponse.body.data.id;
      const updateData = {
        email: "updated@example.com",
        status: 0,
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set(getTestHeaders())
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it("should return 404 when user does not exist", async () => {
      const response = await request(app)
        .put("/api/users/999999")
        .set(getTestHeaders())
        .send({ email: "test@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("用户不存在");
    });

    it("should update an existing user", async () => {
      // 先创建用户
      const userData = generateUserData();
      const createResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(userData);

      const userId = createResponse.body.data.id;
      const updateData = {
        username: "updatedusername",
        email: "updated@example.com",
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data.username).toBe(updateData.username);
      expect(response.body.data.email).toBe(updateData.email);
    });

    it("should return 403 without token", async () => {
      const response = await request(app)
        .put("/api/users/1")
        .set("Content-Type", "application/json")
        .send({ username: "updated" });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user successfully", async () => {
      // 先创建一个用户
      const createResponse = await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(generateUserData());

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.msg).toBe("用户删除成功");
    });

    it("should return 404 when trying to delete non-existent user", async () => {
      const response = await request(app)
        .delete("/api/users/999999")
        .set(getTestHeaders());

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("用户不存在");
    });

    it("should delete an existing user", async () => {
      // 先创建用户
      const userData = generateUserData();
      const createResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(userData);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.msg).toBe("用户删除成功");
    });

    it("should return 403 without token", async () => {
      const response = await request(app).delete("/api/users/1");

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user details", async () => {
      // 先创建一个用户
      const createResponse = await request(app)
        .post("/api/users")
        .set(getTestHeaders())
        .send(generateUserData());

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("id", userId);
      expect(response.body.data).toHaveProperty("username");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should return 404 when user does not exist", async () => {
      const response = await request(app)
        .get("/api/users/999999")
        .set(getTestHeaders());

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("用户不存在");
    });
  });
});
