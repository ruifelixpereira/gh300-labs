import { PaginatedResponse } from "../types/pagination";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

/**
 * Paginates an array of items using offset-based pagination.
 * @param items The full array of items to paginate.
 * @param page The requested page number (1-based). Defaults to 1 if invalid.
 * @param limit The maximum number of items per page. Defaults to 10 if invalid.
 * @returns A paginated response containing the sliced data and pagination meta.
 * @example
 * const result = paginate(allTasks, 2, 5);
 * // result.data contains items 5-9, result.meta.totalPages reflects total
 */
export function paginate<T>(items: T[], page?: number, limit?: number): PaginatedResponse<T> {
  const safePage = isPositiveInt(page) ? page! : DEFAULT_PAGE;
  const safeLimit = isPositiveInt(limit) ? limit! : DEFAULT_LIMIT;

  const total = items.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);

  return {
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages
    }
  };
}

/**
 * Checks if a value is a positive integer.
 */
function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
