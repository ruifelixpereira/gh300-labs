import express from "express";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { tasksRouter } from "./routes/tasks";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/tasks", tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
