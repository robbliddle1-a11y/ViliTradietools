import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { config, live } from "@/core/config";
import { stripe } from "@/core/billing/server";
import { businessIdForCustomer, upsertSubscription, type SubStatus } from "@/core/billing/repo";

/**
 * Stripe → us. Subscribe this endpoint to:
 *   checkout.session.completed, customer.subscription.created,
 *   customer.subscription.updated, customer.subscription.deleted
 * Subscription status is only ever changed here (never trusted from the browser).
 */
export async function POST(req: Request) {
  if (!live.stripe || !config.stripeWebhookSecret) return new NextResponse("Stripe not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", config.stripeWebhookSecret);
  } catch {
    return new NextResponse("Bad signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.client_reference_id && typeof s.customer === "string") {
        await upsertSubscription(s.client_reference_id, {
          stripe_customer_id: s.customer,
          stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : undefined,
          status: "active",
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const businessId = sub.metadata?.business_id || (await businessIdForCustomer(customer));
      if (!businessId) break;
      const periodEnd = sub.items.data[0]?.current_period_end;
      await upsertSubscription(businessId, {
        stripe_customer_id: customer,
        stripe_subscription_id: sub.id,
        status: (event.type === "customer.subscription.deleted" ? "canceled" : sub.status) as SubStatus,
        current_period_end: periodEnd ? new Date(periodEnd * 1000) : undefined,
      });
      break;
    }
  }
  return NextResponse.json({ received: true });
}
