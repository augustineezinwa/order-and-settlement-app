import type { ZodError } from "zod";

import { formatZodError } from "@shared/api/validation.js";

import { HttpError } from "./errors.js";

export function throwValidationError(error: ZodError, fallbackMessage = "Invalid request"): never {
  const { message, fieldErrors } = formatZodError(error);
  throw new HttpError(400, message || fallbackMessage, "VALIDATION_ERROR", { fieldErrors });
}
