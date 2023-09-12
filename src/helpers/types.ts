export interface ResponseRo {
  message?: string;
  statusCode?: number;
}

export interface PaginationResponseRo {
  totalPages: number | null;
  totalCourses: number | null;
}
