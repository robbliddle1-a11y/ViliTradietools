/** Normalise what people type into something we can send a code to. Pure — safe on client and server. */

export type Target = { kind: "phone"; value: string } | { kind: "email"; value: string };

/** Accepts 0412 345 678, 412345678, +61 412 345 678, 61412345678 → +61412345678 (AU mobiles only for now). */
export function normaliseAuMobile(input: string): string | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+61")) d = d.slice(3);
  else if (d.startsWith("61") && d.length === 11) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return /^4\d{8}$/.test(d) ? `+61${d}` : null;
}

export function normaliseEmail(input: string): string | null {
  const e = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}

export function parseTarget(kind: string, raw: string): Target | null {
  if (kind === "phone") {
    const v = normaliseAuMobile(raw);
    return v ? { kind, value: v } : null;
  }
  if (kind === "email") {
    const v = normaliseEmail(raw);
    return v ? { kind, value: v } : null;
  }
  return null;
}

/** +61412345678 → 0412 345 678 */
export function prettyAuMobile(e164: string) {
  const d = "0" + e164.replace(/^\+61/, "");
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}
