import request from "supertest";

import { app } from "../src/app";
import { buildTaskPayload, createTask } from "./helpers/taskTestHelpers";

describe("Task API", () => {
  describe("Happy path CRUD", () => {
    it("GET /tasks returns 200 and an empty paginated collection by default", async () => {
      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [], nextCursor: null, hasMore: false });
    });

      await createTask({ title: "Task 1", description: "Description 1" });
      await new Promise((resolve) => setTimeout(resolve, 1));
      await createTask({ title: "Task 2", description: "Description 2" });
      await new Promise((resolve) => setTimeout(resolve, 1));
      await createTask({ title: "Task 3", description: "Description 3" });
      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(response.body.data.map((task: { title: string }) => task.title)).toEqual([
        "Task 3",
        "Task 2",
        "Task 1"
      ]);
      expect(response.body.nextCursor).toBeNull();
      expect(response.body.hasMore).toBe(false);
    });

    it("GET /tasks?limit=5 returns five tasks and a next cursor", async () => {
      for (let index = 1; index <= 7; index += 1) {
        await createTask({
          title: `Task ${index}`,
          description: `Description ${index}`
        });
      }

      const response = await request(app).get("/tasks").query({ limit: "5" });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.data.map((task: { title: string }) => task.title)).toEqual([
        "Task 7",
        "Task 6",
        "Task 5",
        "Task 4",
        "Task 3"
      ]);
      expect(typeof response.body.nextCursor).toBe("string");
      expect(response.body.hasMore).toBe(true);
    });

    it("GET /tasks?cursor=xxx returns the next page", async () => {
      for (let index = 1; index <= 7; index += 1) {
        await createTask({
          title: `Task ${index}`,
          description: `Description ${index}`
        });
      }

      const firstPage = await request(app).get("/tasks").query({ limit: "5" });
      const response = await request(app)
        .get("/tasks")
        .query({ limit: "5", cursor: firstPage.body.nextCursor as string });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((task: { title: string }) => task.title)).toEqual([
        "Task 2",
        "Task 1"
      ]);
      expect(response.body.nextCursor).toBeNull();
      expect(response.body.hasMore).toBe(false);
    });

    it("POST /tasks creates a task and returns 201", async () => {
      const response = await createTask();

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        title: "Test task",
        description: "Test description",
        status: "todo"
      });
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
    });

    it("GET /tasks/:id returns 200 for an existing task", async () => {
      const created = await createTask();
      const id = created.body.data.id as string;

      const response = await request(app).get(`/tasks/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(id);
    });

    it("PUT /tasks/:id updates an existing task and returns 200", async () => {
      const created = await createTask();
      const id = created.body.data.id as string;

      const response = await request(app)
        .put(`/tasks/${id}`)
        .send(
          buildTaskPayload({
            title: "Updated title",
            description: "Updated description",
            status: "in-progress"
          })
        );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id,
        title: "Updated title",
        description: "Updated description",
        status: "in-progress"
      });
    });

    it("DELETE /tasks/:id removes an existing task and returns 204", async () => {
      const created = await createTask();
      const id = created.body.data.id as string;

      const response = await request(app).delete(`/tasks/${id}`);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");

      const afterDelete = await request(app).get(`/tasks/${id}`);
      expect(afterDelete.status).toBe(404);
    });
  });

  describe("Validation errors", () => {
    it("GET /tasks returns 400 for an invalid limit", async () => {
      const response = await request(app).get("/tasks").query({ limit: "101" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual(["limit must be an integer between 1 and 100"]);
    });

    it("GET /tasks returns 400 for an invalid cursor", async () => {
      const response = await request(app).get("/tasks").query({ cursor: "not-base64" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual(["cursor must be a valid pagination cursor"]);
    });

    it("POST /tasks returns 400 when required fields are missing", async () => {
      const response = await request(app).post("/tasks").send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual([
        "title must be a non-empty string",
        "description must be a non-empty string",
        "status must be one of: todo, in-progress, done"
      ]);
    });

    it("POST /tasks returns 400 for invalid field types", async () => {
      const response = await request(app).post("/tasks").send({
        title: 123,
        description: { content: "bad" },
        status: 42
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual([
        "title must be a non-empty string",
        "description must be a non-empty string",
        "status must be one of: todo, in-progress, done"
      ]);
    });

    it("PUT /tasks/:id returns 400 for invalid payload", async () => {
      const created = await createTask();
      const id = created.body.data.id as string;

      const response = await request(app).put(`/tasks/${id}`).send({
        title: null,
        description: "",
        status: "invalid"
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual([
        "title must be a non-empty string",
        "description must be a non-empty string",
        "status must be one of: todo, in-progress, done"
      ]);
    });
  });

  describe("404 for non-existent ids", () => {
    it("GET /tasks/:id returns 404 when task does not exist", async () => {
      const response = await request(app).get("/tasks/non-existent-id");

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("TASK_NOT_FOUND");
    });

    it("PUT /tasks/:id returns 404 when task does not exist", async () => {
      const response = await request(app)
        .put("/tasks/non-existent-id")
        .send(buildTaskPayload());

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("TASK_NOT_FOUND");
    });

    it("DELETE /tasks/:id returns 404 when task does not exist", async () => {
      const response = await request(app).delete("/tasks/non-existent-id");

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("TASK_NOT_FOUND");
    });
  });

  describe("Edge cases", () => {
    it("POST /tasks returns 400 when title is an empty string", async () => {
      const response = await createTask({ title: "" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toContain("title must be a non-empty string");
    });

    it("POST /tasks accepts a very long description and returns 201", async () => {
      const longDescription = "x".repeat(10_000);
      const response = await createTask({ description: longDescription });

      expect(response.status).toBe(201);
      expect(response.body.data.description).toHaveLength(10_000);
    });
  });
});
