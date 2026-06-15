import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/appError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.path}`, 404, "ROUTE_NOT_FOUND"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null
      }
    });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON request body",
        details: null
      }
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      details: null
    }
  });
}
