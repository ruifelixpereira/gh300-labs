import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/appError";
import { TaskStatus } from "../types/task";

const validStatuses: TaskStatus[] = ["todo", "in-progress", "done"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && validStatuses.includes(value as TaskStatus);
}

export function validateTaskPayload(req: Request, _res: Response, next: NextFunction): void {
  const { title, description, status } = req.body as {
    title?: unknown;
    description?: unknown;
    status?: unknown;
  };

  const errors: string[] = [];

  if (!isNonEmptyString(title)) {
    errors.push("title must be a non-empty string");
  }

  if (!isNonEmptyString(description)) {
    errors.push("description must be a non-empty string");
  }

  if (!isValidStatus(status)) {
    errors.push("status must be one of: todo, in-progress, done");
  }

  if (errors.length > 0) {
    throw new AppError("Invalid task payload", 400, "VALIDATION_ERROR", errors);
  }

  next();
}

export function validateTaskIdParam(req: Request, _res: Response, next: NextFunction): void {
  const { id } = req.params;

  if (!isNonEmptyString(id)) {
    throw new AppError("Task id is required", 400, "VALIDATION_ERROR");
  }

  next();
}
