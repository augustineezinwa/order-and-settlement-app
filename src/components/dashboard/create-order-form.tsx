"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { useRequireSession } from "@/api/auth/use-require-session";
import { ApiError } from "@/api/client";
import { useCreateOrder } from "@/api/orders/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatUsd, parseUsdToCents } from "@/lib/money";
import { lineTotalCents } from "@/lib/orders/line-item";
import { cn } from "@/lib/utils";
import type { ZodError } from "zod";

import { createOrderSchema } from "@shared/api/schemas/order.schema";

type LineItemRow = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type FieldErrors = {
  customerName?: string;
  dueDate?: string;
  lineItems?: Record<string, { description?: string; quantity?: string; unitPrice?: string }>;
  form?: string;
};

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function emptyRow(): LineItemRow {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

function mapZodErrors(issues: ZodError | undefined): FieldErrors {
  if (!issues) return {};

  const errors: FieldErrors = { lineItems: {} };

  for (const issue of issues.issues) {
    const [root, index, field] = issue.path;

    if (root === "customerName") {
      errors.customerName = issue.message;
      continue;
    }

    if (root === "dueDate") {
      errors.dueDate = issue.message;
      continue;
    }

    if (root === "lineItems" && typeof index === "number") {
      const rowKey = String(index);
      errors.lineItems![rowKey] ??= {};
      if (field === "description") errors.lineItems![rowKey].description = issue.message;
      if (field === "quantity") errors.lineItems![rowKey].quantity = issue.message;
      if (field === "unitPriceCents") errors.lineItems![rowKey].unitPrice = issue.message;
      continue;
    }

    if (root === "lineItems" && index === undefined) {
      errors.form = issue.message;
    }
  }

  return errors;
}

export function CreateOrderForm() {
  const router = useRouter();
  const hasSession = useRequireSession();
  const createOrder = useCreateOrder();

  const [customerName, setCustomerName] = useState("");
  const [dueDate, setDueDate] = useState(tomorrowIsoDate);
  const [lineItems, setLineItems] = useState<LineItemRow[]>(() => [emptyRow()]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const orderTotalCents = useMemo(() => {
    return lineItems.reduce((sum, row) => {
      const quantity = Number.parseInt(row.quantity, 10);
      const unitPriceCents = parseUsdToCents(row.unitPrice);
      if (!Number.isFinite(quantity) || quantity <= 0 || unitPriceCents === null) {
        return sum;
      }
      return sum + lineTotalCents({ quantity, unitPriceCents });
    }, 0);
  }, [lineItems]);

  function updateRow(id: string, patch: Partial<Omit<LineItemRow, "id">>) {
    setLineItems((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setLineItems((rows) => [...rows, emptyRow()]);
  }

  function removeRow(id: string) {
    setLineItems((rows) => (rows.length <= 1 ? rows : rows.filter((row) => row.id !== id)));
  }

  function buildPayload() {
    const parsedLineItems = lineItems.map((row) => {
      const quantity = Number.parseInt(row.quantity, 10);
      const unitPriceCents = parseUsdToCents(row.unitPrice);

      return {
        description: row.description.trim(),
        quantity,
        unitPriceCents: unitPriceCents ?? -1,
      };
    });

    return {
      customerName: customerName.trim(),
      dueDate,
      lineItems: parsedLineItems,
    };
  }

  function validateLocally(): FieldErrors {
    const payload = buildPayload();
    const errors: FieldErrors = { lineItems: {} };

    lineItems.forEach((row, index) => {
      const rowErrors: NonNullable<FieldErrors["lineItems"]>[string] = {};
      const quantity = Number.parseInt(row.quantity, 10);

      if (!row.description.trim()) {
        rowErrors.description = "Description is required.";
      }
      if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        rowErrors.quantity = "Enter a whole number of 1 or more.";
      }
      if (parseUsdToCents(row.unitPrice) === null) {
        rowErrors.unitPrice = "Enter a valid price (e.g. 19.99).";
      }

      if (Object.keys(rowErrors).length > 0) {
        errors.lineItems![String(index)] = rowErrors;
      }
    });

    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      const zodErrors = mapZodErrors(parsed.error);
      return {
        customerName: errors.customerName ?? zodErrors.customerName,
        dueDate: errors.dueDate ?? zodErrors.dueDate,
        form: zodErrors.form,
        lineItems: {
          ...zodErrors.lineItems,
          ...errors.lineItems,
        },
      };
    }

    if (Object.keys(errors.lineItems!).length > 0) {
      return errors;
    }

    return {};
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errors = validateLocally();
    if (
      errors.customerName ||
      errors.dueDate ||
      errors.form ||
      (errors.lineItems && Object.keys(errors.lineItems).length > 0)
    ) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const payload = createOrderSchema.parse(buildPayload());

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        router.push(`/orders/${order.id}`);
      },
    });
  }

  const formError =
    createOrder.error instanceof ApiError
      ? createOrder.error.message
      : createOrder.error
        ? "Something went wrong. Please try again."
        : fieldErrors.form ?? null;

  if (!hasSession) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          ← Orders
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a customer, due date, and one or more line items.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="customerName" className="text-sm font-medium">
              Customer
            </label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.customerName)}
              className={cn("h-10", fieldErrors.customerName && "border-destructive")}
            />
            {fieldErrors.customerName && (
              <p className="text-xs text-destructive">{fieldErrors.customerName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due date
            </label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-invalid={Boolean(fieldErrors.dueDate)}
              className={cn("h-10", fieldErrors.dueDate && "border-destructive")}
            />
            {fieldErrors.dueDate && (
              <p className="text-xs text-destructive">{fieldErrors.dueDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium">Line items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              Add line item
            </Button>
          </div>

          <div className="space-y-3">
            {lineItems.map((row, index) => {
              const rowErrors = fieldErrors.lineItems?.[String(index)];

              return (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <div className="space-y-1.5">
                    <label htmlFor={`description-${row.id}`} className="text-xs font-medium text-muted-foreground">
                      Description
                    </label>
                    <Input
                      id={`description-${row.id}`}
                      value={row.description}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                      aria-invalid={Boolean(rowErrors?.description)}
                      className={cn("h-10", rowErrors?.description && "border-destructive")}
                    />
                    {rowErrors?.description && (
                      <p className="text-xs text-destructive">{rowErrors.description}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`quantity-${row.id}`} className="text-xs font-medium text-muted-foreground">
                      Qty
                    </label>
                    <Input
                      id={`quantity-${row.id}`}
                      type="number"
                      min={1}
                      step={1}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                      aria-invalid={Boolean(rowErrors?.quantity)}
                      className={cn("h-10", rowErrors?.quantity && "border-destructive")}
                    />
                    {rowErrors?.quantity && (
                      <p className="text-xs text-destructive">{rowErrors.quantity}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`unitPrice-${row.id}`} className="text-xs font-medium text-muted-foreground">
                      Unit price
                    </label>
                    <Input
                      id={`unitPrice-${row.id}`}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={row.unitPrice}
                      onChange={(e) => updateRow(row.id, { unitPrice: e.target.value })}
                      aria-invalid={Boolean(rowErrors?.unitPrice)}
                      className={cn("h-10", rowErrors?.unitPrice && "border-destructive")}
                    />
                    {rowErrors?.unitPrice && (
                      <p className="text-xs text-destructive">{rowErrors.unitPrice}</p>
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={lineItems.length <= 1}
                      onClick={() => removeRow(row.id)}
                      className="text-muted-foreground"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order total</p>
            <p className="text-xl font-semibold tabular-nums">{formatUsd(orderTotalCents)}</p>
          </div>

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-60"
          >
            {createOrder.isPending ? "Creating…" : "Create order"}
          </button>
        </div>
      </form>
    </div>
  );
}
