export type HateoasLink = {
  href: string;
  method: string;
};

export type HateoasLinks = Record<string, HateoasLink>;

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
