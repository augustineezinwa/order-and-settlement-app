"use client";

import { useState } from "react";

import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  downloadAuthenticatedFile,
  exportOrdersCsvPath,
  exportOrdersFilename,
} from "@/lib/api/download";

function startOfMonthIso(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

function endOfMonthIso(): string {
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.toISOString().slice(0, 10);
}

export function OrdersExportPanel() {
  const [from, setFrom] = useState(startOfMonthIso);
  const [to, setTo] = useState(endOfMonthIso);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setError(null);

    if (!from || !to) {
      setError("Choose a start and end due date.");
      return;
    }

    if (from > to) {
      setError("Start date must be on or before end date.");
      return;
    }

    setExporting(true);
    try {
      await downloadAuthenticatedFile(exportOrdersCsvPath(from, to), exportOrdersFilename(from, to));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-sm font-medium">Export orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Download a CSV of orders whose due date falls within the selected range.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="export-from" className="text-xs font-medium text-muted-foreground">
              Due from
            </label>
            <Input
              id="export-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="export-to" className="text-xs font-medium text-muted-foreground">
              Due to
            </label>
            <Input
              id="export-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9"
            />
          </div>
          <Button type="button" variant="outline" disabled={exporting} onClick={handleExport}>
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
