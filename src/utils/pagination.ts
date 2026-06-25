export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (
  query: { page?: unknown; limit?: unknown },
  defaultLimit = 10,
  maxLimit = 100,
): PaginationParams => {
  let page = parseInt(String(query.page ?? "1"), 10);
  let limit = parseInt(String(query.limit ?? defaultLimit), 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});