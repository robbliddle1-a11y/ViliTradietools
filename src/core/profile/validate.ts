/** Pure validators — shared by client (instant feedback) and server (the real check). */

/**
 * ABN checksum, per the ATO's published algorithm: subtract 1 from the first digit,
 * multiply each digit by its weight, sum, and the total must be divisible by 89.
 * Source: ATO "Format of the ABN" (abr.business.gov.au/Help/AbnFormat).
 */
export function isValidAbn(input: string): boolean {
  const d = input.replace(/\s/g, "");
  if (!/^\d{11}$/.test(d)) return false;
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = d.split("").map(Number);
  digits[0] -= 1;
  return digits.reduce((sum, n, i) => sum + n * w[i], 0) % 89 === 0;
}

export function formatAbn(d: string) {
  const x = d.replace(/\D/g, "");
  return x.length === 11 ? `${x.slice(0, 2)} ${x.slice(2, 5)} ${x.slice(5, 8)} ${x.slice(8)}` : d;
}

/** QBCC licence numbers are numeric. We only check shape; the licence search is the source of truth. */
export function isPlausibleQbcc(input: string) {
  return /^\d{5,8}$/.test(input.replace(/\s/g, ""));
}
