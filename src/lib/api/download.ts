import { API_BASE_URL } from "@/lib/env";
import { ApiError } from "@/api/client";

export async function downloadAuthenticatedFile(path: string, filename: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { credentials: "include" });
  } catch {
    throw new ApiError("Can't reach the server. Is the API running?", 0);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
    throw new ApiError(
      body?.error?.message ?? "Download failed. Please try again.",
      res.status,
      body?.error?.code,
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportOrdersCsvPath(from: string, to: string): string {
  const params = new URLSearchParams({ from, to });
  return `/orders/export?${params.toString()}`;
}

export function exportOrdersFilename(from: string, to: string): string {
  return `orders-${from}-${to}.csv`;
}
