export type ApiErrorBody = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};
