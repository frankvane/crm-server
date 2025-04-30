const request = require("supertest");
const app = require("../../app");
const {
  getTestHeaders,
  generateRoleData,
  generateUserData,
  getTestToken,
} = require("../helpers");

describe("Role Controller", () => {
  let testToken;

  beforeEach(async () => {
    // 在每个测试前获取新的 token
    const userData = generateUserData();
    testToken = await getTestToken(userData);
  });

  describe("POST /api/roles", () => {
    it("should create a new role when valid data is provided", async () => {
      const roleData = generateRoleData();

      const response = await request(app)
        .post("/api/roles")
        .set(getTestHeaders())
        .send(roleData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe(roleData.name);
      expect(response.body.data.code).toBe(roleData.code);
    });

    it("should return 400 when role code already exists", async () => {
      const roleData = generateRoleData();

      // 先创建一个角色
      await request(app)
        .post("/api/roles")
        .set(getTestHeaders())
        .send(roleData);

      // 尝试创建相同code的角色
      const response = await request(app)
        .post("/api/roles")
        .set(getTestHeaders())
        .send(roleData);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("角色代码已存在");
    });

    it("should return 401 when no token is provided", async () => {
      const roleData = generateRoleData();

      const response = await request(app).post("/api/roles").send(roleData);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });

    it("should create a new role", async () => {
      const roleData = {
        name: "testrole",
        description: "Test role description",
      };

      const response = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(roleData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe(roleData.name);
      expect(response.body.data.description).toBe(roleData.description);
    });

    it("should return 403 without token", async () => {
      const roleData = {
        name: "testrole",
        description: "Test role description",
      };

      const response = await request(app)
        .post("/api/roles")
        .set("Content-Type", "application/json")
        .send(roleData);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });

  describe("GET /api/roles", () => {
    it("should return list of roles", async () => {
      const response = await request(app)
        .get("/api/roles")
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/roles")
        .query({ page: 1, pageSize: 10 })
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveProperty("list");
      expect(response.body.data).toHaveProperty("total");
      expect(response.body.data).toHaveProperty("current", 1);
      expect(response.body.data).toHaveProperty("pageSize", 10);
    });

    it("should return list of roles with pagination", async () => {
      const response = await request(app)
        .get("/api/roles")
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
        .get("/api/roles")
        .query({ current: 1, pageSize: 10 });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });

  describe("PUT /api/roles/:id", () => {
    it("should update role when valid data is provided", async () => {
      // 先创建一个角色
      const createResponse = await request(app)
        .post("/api/roles")
        .set(getTestHeaders())
        .send(generateRoleData());

      const roleId = createResponse.body.data.id;
      const updateData = {
        name: "更新后的角色名称",
        description: "更新后的描述",
      };

      const response = await request(app)
        .put(`/api/roles/${roleId}`)
        .set(getTestHeaders())
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it("should return 404 when role does not exist", async () => {
      const response = await request(app)
        .put("/api/roles/999999")
        .set(getTestHeaders())
        .send({ name: "测试角色" });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("角色不存在");
    });

    it("should update an existing role", async () => {
      // 先创建角色
      const roleData = {
        name: "testrole",
        description: "Test role description",
      };

      const createResponse = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(roleData);

      const roleId = createResponse.body.data.id;
      const updateData = {
        name: "updatedrole",
        description: "Updated role description",
      };

      const response = await request(app)
        .put(`/api/roles/${roleId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it("should return 403 without token", async () => {
      const response = await request(app)
        .put("/api/roles/1")
        .set("Content-Type", "application/json")
        .send({ name: "updated" });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });

  describe("DELETE /api/roles/:id", () => {
    it("should delete role successfully", async () => {
      // 先创建一个角色
      const createResponse = await request(app)
        .post("/api/roles")
        .set(getTestHeaders())
        .send(generateRoleData());

      const roleId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/roles/${roleId}`)
        .set(getTestHeaders());

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.msg).toBe("角色删除成功");
    });

    it("should return 404 when trying to delete non-existent role", async () => {
      const response = await request(app)
        .delete("/api/roles/999999")
        .set(getTestHeaders());

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("角色不存在");
    });

    it("should delete an existing role", async () => {
      // 先创建角色
      const roleData = {
        name: "testrole",
        description: "Test role description",
      };

      const createResponse = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${testToken}`)
        .set("Content-Type", "application/json")
        .send(roleData);

      const roleId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/roles/${roleId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.msg).toBe("角色删除成功");
    });

    it("should return 403 without token", async () => {
      const response = await request(app).delete("/api/roles/1");

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(0);
      expect(response.body.msg).toBe("未提供访问令牌");
    });
  });
});
