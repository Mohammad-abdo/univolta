/** Digits only (for card / CVV parsing). */
export function paymentDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Luhn check for primary account number (13–19 digits). */
export function isCardNumberLuhnValid(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number.parseInt(digits[i]!, 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Groups card digits as 4-blocks for display (max 19 digits). */
export function formatCardNumberForInput(raw: string): string {
  const d = paymentDigitsOnly(raw).slice(0, 19);
  const parts: string[] = [];
  for (let i = 0; i < d.length; i += 4) parts.push(d.slice(i, i + 4));
  return parts.join(" ");
}

export function isAmexPan(digits: string): boolean {
  return digits.length === 15 && /^3[47]\d{13}$/.test(digits);
}

/** CVV: 4 digits for Amex-style 15-digit PAN starting 34/37, otherwise 3. */
export function isCvvValidForPan(panDigits: string, cvvRaw: string): boolean {
  const cvv = paymentDigitsOnly(cvvRaw);
  if (!/^\d+$/.test(cvv)) return false;
  if (isAmexPan(panDigits)) return cvv.length === 4;
  return cvv.length === 3;
}

/** Cardholder: letters (incl. Arabic), spaces, common punctuation; 2–120 chars. */
const CARDHOLDER_RE = /^[\p{L}\s'’.\-]{2,120}$/u;

export function isCardholderNameValid(name: string): boolean {
  const t = name.trim();
  return CARDHOLDER_RE.test(t);
}

export type ExpiryYYYYMMStatus = "empty" | "format" | "past" | "future_cap" | "ok";

/** `value` is from `<input type="month" />` → `YYYY-MM`. */
export function validateExpiryMonthValue(value: string, opts?: { maxYearsAhead?: number }): ExpiryYYYYMMStatus {
  const maxYears = opts?.maxYearsAhead ?? 20;
  if (!value?.trim()) return "empty";
  const m = value.match(/^(\d{4})-(\d{2})$/);
  if (!m) return "format";
  const y = Number.parseInt(m[1]!, 10);
  const mo = Number.parseInt(m[2]!, 10);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || mo < 1 || mo > 12) return "format";
  const now = new Date();
  const lastDay = new Date(y, mo, 0, 23, 59, 59, 999);
  if (lastDay < now) return "past";
  const cap = new Date(now.getFullYear() + maxYears, now.getMonth() + 1, 0, 23, 59, 59, 999);
  if (lastDay > cap) return "future_cap";
  return "ok";
}

/** API / legacy display: `YYYY-MM` → `MM/YY`. */
export function expiryYYYYMMToMMYY(value: string): string | null {
  const m = value.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return `${m[2]}/${m[1]!.slice(-2)}`;
}

export function currentMonthMin(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function maxMonthMax(yearsAhead: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + yearsAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
