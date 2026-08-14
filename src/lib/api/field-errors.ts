import type { FieldErrors } from "@shared/api/validation";
import { fieldErrorsFromDetails, firstFieldError } from "@shared/api/validation";

export { fieldErrorsFromDetails, firstFieldError };
export type { FieldErrors };

export type CreateOrderFieldErrors = {
  customerName?: string;
  dueDate?: string;
  lineItems?: Record<string, { description?: string; quantity?: string; unitPrice?: string }>;
  form?: string;
};

export function mapCreateOrderFieldErrors(fieldErrors: FieldErrors): CreateOrderFieldErrors {
  const errors: CreateOrderFieldErrors = { lineItems: {} };

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages[0];
    if (!message) continue;

    if (key === "customerName") {
      errors.customerName = message;
      continue;
    }

    if (key === "dueDate") {
      errors.dueDate = message;
      continue;
    }

    if (key === "lineItems") {
      errors.form = message;
      continue;
    }

    const lineItemMatch = /^lineItems\.(\d+)\.(\w+)$/.exec(key);
    if (lineItemMatch) {
      const [, index, field] = lineItemMatch;
      errors.lineItems![index] ??= {};
      if (field === "description") errors.lineItems![index].description = message;
      if (field === "quantity") errors.lineItems![index].quantity = message;
      if (field === "unitPriceCents") errors.lineItems![index].unitPrice = message;
      continue;
    }

    if (key === "_form") {
      errors.form = message;
    }
  }

  return errors;
}

export type RecordPaymentFieldErrors = {
  amount?: string;
  paidAt?: string;
  note?: string;
  form?: string;
};

export function mapRecordPaymentFieldErrors(fieldErrors: FieldErrors): RecordPaymentFieldErrors {
  const errors: RecordPaymentFieldErrors = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages[0];
    if (!message) continue;

    if (key === "amountCents") errors.amount = message;
    if (key === "paidAt") errors.paidAt = message;
    if (key === "note") errors.note = message;
    if (key === "_form") errors.form = message;
  }

  return errors;
}

export type AuthFieldErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export function mapAuthFieldErrors(fieldErrors: FieldErrors): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages[0];
    if (!message) continue;

    if (key === "email") errors.email = message;
    if (key === "password") errors.password = message;
    if (key === "_form") errors.form = message;
  }

  return errors;
}
