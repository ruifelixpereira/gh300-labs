import { AppError } from "../errors/appError";
import { PaginatedResponse } from "../types/pagination";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Paginates an array of items using cursor-based pagination.
 * @param items The full array of items to paginate.
 * @param limit The maximum number of items per page. Defaults to 20.
 * @param cursor The opaque cursor for the next page.
 * @returns A paginated response containing the sliced data and next cursor state.
 * @example
 * const result = paginate(allTasks, "5", "YjQ2MzYx...");
 * // result.data contains the next 5 items after the cursor
 */
export function paginate<T extends { id: string }>(
  items: T[],
  limit?: unknown,
  cursor?: unknown
): PaginatedResponse<T> {
  const safeLimit = parseLimit(limit);
  const start = resolveStartIndex(items, cursor);
  const data = items.slice(start, start + safeLimit);
  const hasMore = start + safeLimit < items.length;

  const nextCursor = hasMore && data.length > 0 ? encodeCursor(data[data.length - 1].id) : null;

  return {
    data,
    nextCursor,
    hasMore
  };
}

/**
 * Encodes a task id into an opaque cursor.
 */
function encodeCursor(taskId: string): string {
  return Buffer.from(taskId, "utf8").toString("base64url");
}

function resolveStartIndex<T extends { id: string }>(items: T[], cursor: unknown): number {
  if (typeof cursor === "undefined") {
    return 0;
  }

  if (typeof cursor !== "string" || cursor.trim() === "") {
    throw new AppError(
      "Invalid query parameters",
      400,
      "VALIDATION_ERROR",
      ["cursor must be a valid pagination cursor"]
    );
  }

  const taskId = decodeCursor(cursor);
  if (!taskId) {
    throw new AppError(
      "Invalid query parameters",
      400,
      "VALIDATION_ERROR",
      ["cursor must be a valid pagination cursor"]
    );
  }

  const index = items.findIndex((item) => item.id === taskId);
  if (index === -1) {
    throw new AppError(
      "Invalid query parameters",
      400,
      "VALIDATION_ERROR",
      ["cursor must reference an existing task"]
    );
  }

  return index + 1;
}

function decodeCursor(cursor: string): string | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    return encodeCursor(decoded) === cursor ? decoded : null;
  } catch {
    return null;
  }
}

function parseLimit(limit: unknown): number {
  if (typeof limit === "undefined") {
    return DEFAULT_LIMIT;
  }

  const value = typeof limit === "string" && limit.trim() !== "" ? Number(limit) : limit;
  if (!isPositiveInt(value) || value > MAX_LIMIT) {
    throw new AppError(
      "Invalid query parameters",
      400,
      "VALIDATION_ERROR",
      [`limit must be an integer between 1 and ${MAX_LIMIT}`]
    );
  }

  return value;
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
