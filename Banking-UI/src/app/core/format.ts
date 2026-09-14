/** Small shared display helpers. */

export function money(amount: number | null | undefined, currency = 'ZAR'): string {
  const n = typeof amount === 'number' ? amount : 0;
  const symbol = currency === 'ZAR' ? 'R' : currency + ' ';
  return `${symbol} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Mask all but the last 4 characters of an account/card number. */
export function maskNumber(value: string | null | undefined, visible = 4): string {
  if (!value) return '••••••••';
  const last = value.slice(-visible);
  return '•'.repeat(Math.max(0, value.length - visible)) + last;
}

/** Two-letter initials for the avatar chip. */
export function initials(name: string | null | undefined): string {
  if (!name) return 'CN';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'CN';
}
