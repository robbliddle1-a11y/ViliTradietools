"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { config, live } from "@/core/config";
import { requireBusiness } from "@/core/profile/repo";
import { requireUser } from "@/core/auth/server";
import { getSubscription, upsertSubscription } from "./repo";
import { stripe } from "./server";

/** Start (or resume) the subscription via Stripe Checkout. Mock mode just switches it on. */
export async function subscribeAction() {
  const biz = await requireBusiness();
  const user = await requireUser();

  if (!live.stripe) {
    await upsertSubscription(biz.id, { status: "active" });
    revalidatePath("/", "layout");
    redirect("/home?subscribed=1");
  }

  const sub = await getSubscription(biz.id);
  let customer = sub?.stripe_customer_id ?? undefined;
  if (!customer) {
    const c = await stripe().customers.create({
      name: biz.name,
      email: biz.email ?? user.email ?? undefined,
      phone: biz.phone ?? user.phone ?? undefined,
      metadata: { business_id: biz.id, abn: biz.abn ?? "" },
    });
    customer = c.id;
    await upsertSubscription(biz.id, { stripe_customer_id: customer });
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price: config.stripePriceId!, quantity: 1 }],
    client_reference_id: biz.id,
    subscription_data: { metadata: { business_id: biz.id } },
    // Australian business customers expect a tax invoice with GST shown.
    automatic_tax: { enabled: false }, // TODO(config): enable once Stripe Tax is set up for AU GST
    allow_promotion_codes: true,
    success_url: `${config.appUrl}/home?subscribed=1`,
    cancel_url: `${config.appUrl}/billing`,
  });
  redirect(session.url!);
}

/** Stripe's hosted portal for card changes, invoices and cancelling. */
export async function manageBillingAction() {
  const biz = await requireBusiness();
  const sub = await getSubscription(biz.id);
  if (!live.stripe) {
    await upsertSubscription(biz.id, { status: "canceled" });
    revalidatePath("/", "layout");
    redirect("/billing");
  }
  if (!sub?.stripe_customer_id) redirect("/billing");
  const portal = await stripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${config.appUrl}/billing`,
  });
  redirect(portal.url);
}
