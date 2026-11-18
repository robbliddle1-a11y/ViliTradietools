import "server-only";
import { one, query } from "@/core/db";

export type SubStatus = "none" | "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "unpaid";

export type Subscription = {
  business_id: string;
  status: SubStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: Date | null;
};

/** One subscription unlocks every paid tool. past_due keeps access while Stripe retries the card. */
export function hasAccess(s: Subscription | null) {
  return !!s && ["active", "trialing", "past_due"].includes(s.status);
}

export async function getSubscription(businessId: string) {
  return one<Subscription>(
    `select business_id, status, stripe_customer_id, stripe_subscription_id, current_period_end
     from subscriptions where business_id = $1`,
    [businessId],
  );
}

export async function upsertSubscription(
  businessId: string,
  v: Partial<Omit<Subscription, "business_id">>,
) {
  await query(
    `insert into subscriptions (business_id, status, stripe_customer_id, stripe_subscription_id, current_period_end)
     values ($1, coalesce($2,'none'), $3, $4, $5)
     on conflict (business_id) do update set
       status = coalesce($2, subscriptions.status),
       stripe_customer_id = coalesce($3, subscriptions.stripe_customer_id),
       stripe_subscription_id = coalesce($4, subscriptions.stripe_subscription_id),
       current_period_end = coalesce($5, subscriptions.current_period_end),
       updated_at = now()`,
    [businessId, v.status ?? null, v.stripe_customer_id ?? null, v.stripe_subscription_id ?? null, v.current_period_end ?? null],
  );
}

export async function businessIdForCustomer(customerId: string) {
  return (await one<{ business_id: string }>(`select business_id from subscriptions where stripe_customer_id = $1`, [customerId]))
    ?.business_id;
}
