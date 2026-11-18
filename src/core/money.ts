/** Money helpers. Everything is integer cents (AUD). Pure — safe on client and server. */

/** "$45,200.50" / "45200.5" / "45k" → 4520050 cents. Returns null if it isn't a number. */
export function parseDollars(input: string): number | null {
  let s = input.trim().toLowerCase().replace(/[$,\s]/g, "");
  if (!s) return null;
  let mult = 1;
  if (s.endsWith("k")) {
    mult = 1000;
    s = s.slice(0, -1);
  }
  if (!/^-?\d*\.?\d{0,2}$/.test(s) || s === "-" || s === ".") return null;
  const n = Number(s) * mult;
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** 4520050 → "45,200.50" (no $) for input fields. */
export function centsToInput(cents: number) {
  return (cents / 100).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
export function formatAud(cents: number, signed = false) {
  const sign = cents < 0 ? "−" : signed && cents > 0 ? "+" : "";
  return sign + aud.format(Math.abs(cents) / 100);
}

/**
 * GST at 10% (A New Tax System (Goods and Services Tax) Act 1999 (Cth) s 9-70).
 * GST in an inclusive price = 1/11 of it. Rounded to the nearest cent, sign preserved.
 */
export function splitGst(amountCents: number, includesGst: boolean, gstRegistered: boolean) {
  if (!gstRegistered) return { ex: amountCents, gst: 0, inc: amountCents };
  const sign = Math.sign(amountCents);
  const a = Math.abs(amountCents);
  if (includesGst) {
    const gst = Math.round(a / 11);
    return { ex: sign * (a - gst), gst: sign * gst, inc: amountCents };
  }
  const gst = Math.round(a / 10);
  return { ex: amountCents, gst: sign * gst, inc: sign * (a + gst) };
}
