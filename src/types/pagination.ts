/**
 * A paginated API response wrapper.
 */
export interface PaginatedResponse<T> {
  /** The items for the current page. */
  data: T[];

  /** Opaque cursor for the next page, or null when there are no more results. */
  nextCursor: string | null;

  /** Indicates whether another page can be fetched. */
  hasMore: boolean;
}
