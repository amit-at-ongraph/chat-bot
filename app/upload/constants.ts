// Note: Api Limit should be multiple of rows per page and greater than or equal to rows per page
export const PAGINATION_CONFIG = {
  apiLimit: 10,
  rowsPerPage: 5,
  cacheDepth: 5,
} as const;
