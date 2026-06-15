import { randomUUID } from "crypto";

import { AppError } from "../errors/appError";
import { CreateTaskInput, Task, UpdateTaskInput } from "../types/task";

const tasks: Task[] = [];

/**
 * Returns all tasks currently stored in memory.
 * @returns The in-memory list of tasks.
 * @example
 * const allTasks = getAllTasks();
 */
export function getAllTasks(): Task[] {
  return tasks;
}

/**
 * Finds one task by id.
 * @param id The task id.
 * @returns The matching task if found.
 * @example
 * const task = getTaskById("a-task-id");
 */
export function getTaskById(id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

/**
 * Creates and stores a new task.
 * @param input The task payload.
 * @returns The created task.
 * @example
 * const created = createTask({ title: "A", description: "B", status: "todo" });
 */
export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status,
    createdAt: now,
    updatedAt: now
  };

  tasks.push(task);
  return task;
}

/**
 * Replaces an existing task by id.
 * @param id The task id.
 * @param input The replacement task payload.
 * @returns The updated task.
 * @example
 * const updated = updateTask("a-task-id", { title: "X", description: "Y", status: "done" });
 */
export function updateTask(id: string, input: UpdateTaskInput): Task {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  const existingTask = tasks[index];
  const updatedTask: Task = {
    ...existingTask,
    title: input.title,
    description: input.description,
    status: input.status,
    updatedAt: new Date().toISOString()
  };

  tasks[index] = updatedTask;
  return updatedTask;
}

/**
 * Deletes a task by id.
 * @param id The task id.
 * @returns Void.
 * @example
 * deleteTask("a-task-id");
 */
export function deleteTask(id: string): void {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  tasks.splice(index, 1);
}

/**
 * Clears all tasks from the in-memory store.
 * @returns Void.
 * @example
 * clearTasksStore();
 */
export function clearTasksStore(): void {
  tasks.length = 0;
}
