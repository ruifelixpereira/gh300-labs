# Lab 3 API - Task Management

A Node.js REST API for task management built with Express and TypeScript.

## Features

- Task CRUD endpoints
- In-memory task storage (no database)
- Input validation middleware
- Centralized JSON error handling
- Request logging middleware
- Health check endpoint
- Jest + Supertest test suite

## Tech Stack

- Node.js
- Express
- TypeScript
- Jest
- Supertest

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development mode

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Start production build

```bash
npm start
```

The API runs on port `3000` by default. Set `PORT` to override.

## Testing

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## API Endpoints

Base URL: `http://localhost:3000`

### Health

- `GET /health`
- Response: `200`

### Tasks

#### Get all tasks

- `GET /tasks?limit=20[&cursor=<url-encoded-opaque-cursor>]`
- Response: `200`
- Response body: `{ "data": Task[], "nextCursor": string | null, "hasMore": boolean }`

#### Get one task

- `GET /tasks/:id`
- Response: `200` or `404`

#### Create task

- `POST /tasks`
- Response: `201` or `400`

Example request body:

```json
{
  "title": "Write docs",
  "description": "Document the API",
  "status": "todo"
}
```

#### Update task

- `PUT /tasks/:id`
- Response: `200`, `400`, or `404`

#### Delete task

- `DELETE /tasks/:id`
- Response: `204` or `404`

## Task Model

```ts
type TaskStatus = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
```

## Error Response Format

Errors use a consistent JSON shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid task payload",
    "details": ["title must be a non-empty string"]
  }
}
```

## Notes

- Data is stored in memory and is reset when the server restarts.
- Request logs include timestamp, method, URL, status code, and response time.
