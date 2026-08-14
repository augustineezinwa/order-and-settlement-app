import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { HttpError } from "../errors.js";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { error: { message: err.message, ...(err.code ? { code: err.code } : {}) } },
      err.status as ContentfulStatusCode,
    );
  }

  console.error(err);
  return c.json({ error: { message: "Internal server error", code: "INTERNAL_ERROR" } }, 500);
};
