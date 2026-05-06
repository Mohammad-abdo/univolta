const DEFAULT_PREFIX = "UV";

function hashToInt(input: string): number {
  // Small deterministic hash (stable across server/client).
  // Not cryptographic; only for display codes.
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export function formatApplicationCode(id: string, prefix = DEFAULT_PREFIX): string {
  const safe = (id || "").trim();
  if (!safe) return `${prefix}-000-000`;

  const n = hashToInt(safe) % 1_000_000; // 000000 .. 999999
  const hi = Math.floor(n / 1000);
  const lo = n % 1000;
  return `${prefix}-${pad3(hi)}-${pad3(lo)}`;
}

