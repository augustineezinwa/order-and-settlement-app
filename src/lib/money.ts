export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const USD_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parseUsdToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || !USD_PATTERN.test(trimmed)) {
    return null;
  }

  const [whole, fraction = ""] = trimmed.split(".");
  const centsFromFraction = fraction.padEnd(2, "0").slice(0, 2);
  const cents = Number(whole) * 100 + Number(centsFromFraction);

  if (!Number.isSafeInteger(cents) || cents < 0) {
    return null;
  }

  return cents;
}
