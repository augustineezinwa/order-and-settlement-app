export type ApiErrorBody = {
  message: string;
  code?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
    maxAllowedCents?: number;
    [key: string]: unknown;
  };
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};
