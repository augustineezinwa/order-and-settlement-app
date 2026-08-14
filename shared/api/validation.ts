import type { ZodError } from "zod";

export type FieldErrors = Record<string, string[]>;

export function formatZodError(error: ZodError): { message: string; fieldErrors: FieldErrors } {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "_form";
    fieldErrors[key] ??= [];
    if (!fieldErrors[key]!.includes(issue.message)) {
      fieldErrors[key]!.push(issue.message);
    }
  }

  return {
    message: error.issues[0]?.message ?? "Invalid request",
    fieldErrors,
  };
}

export function firstFieldError(fieldErrors: FieldErrors, key: string): string | undefined {
  return fieldErrors[key]?.[0];
}

export function fieldErrorsFromDetails(details?: Record<string, unknown>): FieldErrors | null {
  const fieldErrors = details?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object" || Array.isArray(fieldErrors)) {
    return null;
  }
  return fieldErrors as FieldErrors;
}
