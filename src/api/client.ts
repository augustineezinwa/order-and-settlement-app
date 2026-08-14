import type { ApiErrorResponse } from "@shared/api/errors";
import { API_BASE_URL } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function parseErrorResponse(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
  const error = body?.error;
  return new ApiError(
    error?.message ?? "Something went wrong. Please try again.",
    res.status,
    error?.code,
    error?.details,
  );
}

/**
 * The session lives in an httpOnly cookie the browser attaches automatically
 * — `credentials: "include"` is what makes that happen. There is no token
 * for this code to read or send by hand.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Can't reach the server. Is the API running?", 0);
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
