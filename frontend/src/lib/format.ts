// format.ts — PropInvest AI number formatting utilities
// Handles Indian number system: 1,00,000 (lakh) and 1,00,00,000 (crore)

/** Format as Indian Rupee short form: ₹1.2Cr, ₹45.6L, ₹12,500 */
export function formatINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)}Cr`;
  if (abs >= 100_000)    return `${sign}₹${(abs / 100_000).toFixed(2)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format INR with 1 decimal for cleaner display: ₹1.2Cr, ₹45.6L */
export function formatINRShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000)    return `${sign}₹${(abs / 100_000).toFixed(1)}L`;
  if (abs >= 1_000)      return `${sign}₹${(abs / 1_000).toFixed(0)}K`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

/** Full Indian number format with commas: ₹1,00,00,000 */
export function formatINRFull(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a plain number with Indian commas: 1,00,000 */
export function formatNumberIN(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

/** Format percentage with configurable decimals */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format a multiplier: 1.85x */
export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

/** Color class based on whether value beats threshold */
export function colorForValue(value: number, threshold = 0): string {
  return value >= threshold
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
}

/** Format a large INR value for input field display with commas */
export function formatInputINR(value: number): string {
  if (!value) return "";
  return value.toLocaleString("en-IN");
}

/** Parse an input string that may contain commas back to number */
export function parseInputINR(str: string): number {
  return Number(str.replace(/,/g, "")) || 0;
}

/** Human-readable INR label for sub-hints: "₹45.6L" */
export function hintINR(value: number): string {
  return formatINR(value);
}

/** Format crore/lakh label for input previews */
export function formatINRLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `₹${(abs / 10_000_000).toFixed(2)} Crore`;
  if (abs >= 100_000)    return `₹${(abs / 100_000).toFixed(2)} Lakh`;
  if (abs >= 1_000)      return `₹${(abs / 1_000).toFixed(0)}K`;
  return `₹${abs.toLocaleString("en-IN")}`;
}
