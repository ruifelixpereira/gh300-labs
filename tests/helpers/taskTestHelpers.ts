import request, { Response } from "supertest";

import { app } from "../../src/app";

export interface TaskPayload {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
}

/**
 * Builds a valid task payload for tests.
 * @param overrides Partial fields to override the defaults.
 * @returns A valid task payload object.
 * @example
 * const payload = buildTaskPayload({ status: "done" });
 */
export function buildTaskPayload(overrides: Partial<TaskPayload> = {}): TaskPayload {
  return {
    title: "Test task",
    description: "Test description",
    status: "todo",
    ...overrides
  };
}

/**
 * Creates a task via HTTP and returns the supertest response.
 * @param overrides Partial payload fields to override default task values.
 * @returns The HTTP response from POST /tasks.
 * @example
 * const response = await createTask();
 */
export async function createTask(overrides: Partial<TaskPayload> = {}): Promise<Response> {
  return request(app).post("/tasks").send(buildTaskPayload(overrides));
}
