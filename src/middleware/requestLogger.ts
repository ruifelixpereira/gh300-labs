import { NextFunction, Request, Response } from "express";

/**
 * Logs request metadata and response timing for each incoming HTTP request.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The Express next callback.
 * @returns Void.
 * @example
 * app.use(requestLogger);
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    const timestamp = new Date().toISOString();

    console.log(
      `${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs.toFixed(2)}ms`
    );
  });

  next();
}
