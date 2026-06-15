/**
 * Metadata describing the current page of results.
 */
export interface PaginationMeta {
  /** Current page number (1-based). */
  page: number;

  /** Maximum items per page. */
  limit: number;

  /** Total number of items across all pages. */
  total: number;

  /** Total number of pages. */
  totalPages: number;
}

/**
 * A paginated API response wrapper.
 */
export interface PaginatedResponse<T> {
  /** The items for the current page. */
  data: T[];

  /** Pagination metadata. */
  meta: PaginationMeta;
}
