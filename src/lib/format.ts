export function formatBBLs(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export function formatPctDecimal(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}