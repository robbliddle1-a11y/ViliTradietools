/** Running contract total for a job. Pure, so it's unit-testable and reusable in the PDF. */

type V = { status: string; amount_inc_cents: number; days_delta: number };

export function contractTotals(contractPriceCents: number, variations: V[]) {
  const signed = variations.filter((v) => v.status === "signed");
  const sent = variations.filter((v) => v.status === "sent");
  const sum = (xs: V[], k: "amount_inc_cents" | "days_delta") => xs.reduce((a, v) => a + Number(v[k]), 0);
  return {
    original: contractPriceCents,
    approved: sum(signed, "amount_inc_cents"),
    current: contractPriceCents + sum(signed, "amount_inc_cents"),
    pending: sum(sent, "amount_inc_cents"),
    pendingCount: sent.length,
    approvedDays: sum(signed, "days_delta"),
    /** What the total becomes if everything waiting on the client is signed. */
    ifAllSigned: contractPriceCents + sum(signed, "amount_inc_cents") + sum(sent, "amount_inc_cents"),
  };
}
