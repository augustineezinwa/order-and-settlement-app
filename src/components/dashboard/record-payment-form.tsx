"use client";

import { useRef, useState, type FormEvent } from "react";

import { ApiError } from "@/api/client";
import { useRecordPayment } from "@/api/payments/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatUsd, parseUsdToCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { recordPaymentSchema } from "@shared/api/schemas/payment.schema";

type RecordPaymentFormProps = {
  orderId: string;
  amountDueCents: number;
};

type FieldErrors = {
  amount?: string;
  paidAt?: string;
  note?: string;
  form?: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function overpaymentMessage(maxAllowedCents: number): string {
  return `Payment exceeds amount due. Maximum allowed: ${formatUsd(maxAllowedCents)}.`;
}

export function RecordPaymentForm({ orderId, amountDueCents }: RecordPaymentFormProps) {
  const recordPayment = useRecordPayment();
  const idempotencyKeyRef = useRef<string | null>(null);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function openForm() {
    setPaidAt(todayIsoDate());
    setOpen(true);
  }

  function resetForm() {
    setAmount("");
    setPaidAt(todayIsoDate());
    setNote("");
    setFieldErrors({});
    idempotencyKeyRef.current = null;
  }

  function closeForm() {
    setOpen(false);
    resetForm();
    recordPayment.reset();
  }

  function validate(): FieldErrors {
    const amountCents = parseUsdToCents(amount);
    const errors: FieldErrors = {};

    if (amountCents === null) {
      errors.amount = "Enter a valid amount (e.g. 50.00).";
    } else if (amountCents < 1) {
      errors.amount = "Minimum payment is $0.01.";
    } else if (amountCents > amountDueCents) {
      errors.amount = overpaymentMessage(amountDueCents);
    }

    const payload = {
      amountCents: amountCents ?? -1,
      paidAt,
      note: note.trim() || undefined,
    };

    const parsed = recordPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "amountCents" && !errors.amount) errors.amount = issue.message;
        if (field === "paidAt" && !errors.paidAt) errors.paidAt = issue.message;
        if (field === "note" && !errors.note) errors.note = issue.message;
      }
    }

    return errors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errors = validate();
    if (errors.amount || errors.paidAt || errors.note || errors.form) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    idempotencyKeyRef.current ??= crypto.randomUUID();

    const payload = recordPaymentSchema.parse({
      amountCents: parseUsdToCents(amount)!,
      paidAt,
      note: note.trim() || undefined,
    });

    recordPayment.mutate(
      {
        orderId,
        idempotencyKey: idempotencyKeyRef.current,
        ...payload,
      },
      {
        onSuccess: () => {
          closeForm();
        },
      },
    );
  }

  const mutationError = recordPayment.error;
  let formError: string | null = fieldErrors.form ?? null;

  if (mutationError instanceof ApiError) {
    if (mutationError.code === "OVERPAYMENT") {
      const maxAllowedCents =
        typeof mutationError.details?.maxAllowedCents === "number"
          ? mutationError.details.maxAllowedCents
          : amountDueCents;
      formError = overpaymentMessage(maxAllowedCents);
    } else {
      formError = mutationError.message;
    }
  } else if (mutationError) {
    formError = "Something went wrong. Please try again.";
  }

  const amountError =
    fieldErrors.amount ??
    (mutationError instanceof ApiError && mutationError.code === "OVERPAYMENT"
      ? formError
      : undefined);

  if (amountDueCents <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-3">
      {!open ? (
        <Button type="button" size="lg" className="rounded-full" onClick={openForm}>
          Record payment
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Record payment</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Amount due: {formatUsd(amountDueCents)}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              Cancel
            </Button>
          </div>

          {formError && !amountError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="payment-amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="payment-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (fieldErrors.amount) setFieldErrors((prev) => ({ ...prev, amount: undefined }));
                  if (recordPayment.error) recordPayment.reset();
                }}
                aria-invalid={Boolean(amountError)}
                className={cn("h-10", amountError && "border-destructive")}
              />
              {amountError && <p className="text-xs text-destructive">{amountError}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="payment-date" className="text-sm font-medium">
                Payment date
              </label>
              <Input
                id="payment-date"
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                aria-invalid={Boolean(fieldErrors.paidAt)}
                className={cn("h-10", fieldErrors.paidAt && "border-destructive")}
              />
              {fieldErrors.paidAt && <p className="text-xs text-destructive">{fieldErrors.paidAt}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="payment-note" className="text-sm font-medium">
                Note <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="payment-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-invalid={Boolean(fieldErrors.note)}
                className={cn("h-10", fieldErrors.note && "border-destructive")}
              />
              {fieldErrors.note && <p className="text-xs text-destructive">{fieldErrors.note}</p>}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={recordPayment.isPending}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-60"
            >
              {recordPayment.isPending ? "Recording…" : "Record payment"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
