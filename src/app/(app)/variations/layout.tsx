import { requirePaid } from "@/core/billing/server";

/** Paywall: every route under /variations needs an active subscription. */
export default async function VariationsLayout({ children }: { children: React.ReactNode }) {
  await requirePaid();
  return <>{children}</>;
}
