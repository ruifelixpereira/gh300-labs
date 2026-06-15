import { Router } from "express";

import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask
} from "../data/tasksStore";
import { AppError } from "../errors/appError";
import { validateTaskIdParam, validateTaskPayload } from "../middleware/validateTask";
import { paginate } from "../utils/paginate";

const tasksRouter = Router();

/**
 * Lists tasks with offset-based pagination.
 * @param req The Express request object with optional query params page and limit.
 * @param req.query.page The page number (1-based, defaults to 1).
 * @param req.query.limit The max items per page (defaults to 10).
 * @param res The Express response object.
 * @returns Sends HTTP 200 with JSON body: { data: Task[], meta: PaginationMeta }.
 * @example
 * curl -X GET http://localhost:3000/tasks?page=2&limit=5
 */
tasksRouter.get("/", (_req, res) => {
  const page = Number(_req.query.page) || undefined;
  const limit = Number(_req.query.limit) || undefined;
  const tasks = getAllTasks();
  const result = paginate(tasks, page, limit);
  res.status(200).json(result);
});

/**
 * Gets one task by id.
 * @param req The Express request object with route parameter id.
 * @param req.params.id The task identifier.
 * @param res The Express response object.
 * @returns Sends HTTP 200 with JSON body: { data: Task } when found.
 * @example
 * curl -X GET http://localhost:3000/tasks/2d2beaf0-8572-4d58-9e36-1b3b3df0b10e
 */
tasksRouter.get("/:id", validateTaskIdParam, (req, res) => {
  const task = getTaskById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  res.status(200).json({ data: task });
});

/**
 * Creates a new task.
 * @param req The Express request object containing title, description, and status in the body.
 * @param req.body.title The task title.
 * @param req.body.description The task description.
 * @param req.body.status The task status (todo | in-progress | done).
 * @param res The Express response object.
 * @returns Sends HTTP 201 with JSON body: { data: Task }.
 * @example
 * curl -X POST http://localhost:3000/tasks \
 *   -H "Content-Type: application/json" \
 *   -d '{"title":"Write docs","description":"Add API docs","status":"todo"}'
 */
tasksRouter.post("/", validateTaskPayload, (req, res) => {
  const createdTask = createTask(req.body);
  res.status(201).json({ data: createdTask });
});

/**
 * Replaces an existing task by id.
 * @param req The Express request object with route parameter id and full task payload in body.
 * @param req.params.id The task identifier.
 * @param req.body.title The new task title.
 * @param req.body.description The new task description.
 * @param req.body.status The new task status (todo | in-progress | done).
 * @param res The Express response object.
 * @returns Sends HTTP 200 with JSON body: { data: Task }.
 * @example
 * curl -X PUT http://localhost:3000/tasks/2d2beaf0-8572-4d58-9e36-1b3b3df0b10e \
 *   -H "Content-Type: application/json" \
 *   -d '{"title":"Write docs v2","description":"Update API docs","status":"in-progress"}'
 */
tasksRouter.put("/:id", validateTaskIdParam, validateTaskPayload, (req, res) => {
  const updatedTask = updateTask(req.params.id, req.body);
  res.status(200).json({ data: updatedTask });
});

/**
 * Deletes a task by id.
 * @param req The Express request object with route parameter id.
 * @param req.params.id The task identifier.
 * @param res The Express response object.
 * @returns Sends HTTP 204 with no response body.
 * @example
 * curl -X DELETE http://localhost:3000/tasks/2d2beaf0-8572-4d58-9e36-1b3b3df0b10e
 */
tasksRouter.delete("/:id", validateTaskIdParam, (req, res) => {
  deleteTask(req.params.id);
  res.status(204).send();
});

export { tasksRouter };
