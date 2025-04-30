const request = require("supertest");
const app = require("../../app");
const { getTestHeaders, generateUserData } = require("../helpers");

describe("User Controller", () => {
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
  });

  describe("GET /api/users", () => {
    it("should return list of users with pagination", async () => {
      const response = await request(app)
        .get("/api/users")
        .query({ page: 1, pageSize: 10 })
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("list");
      expect(response.body.data).toHaveProperty("total");
      expect(response.body.data).toHaveProperty("current", 1);
      expect(response.body.data).toHaveProperty("pageSize", 10);

      // 验证用户列表数据结构
      if (response.body.data.list.length > 0) {
        const user = response.body.data.list[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("status");
        expect(user).not.toHaveProperty("password");
      }
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
