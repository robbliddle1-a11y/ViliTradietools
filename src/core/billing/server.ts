import "server-only";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { config } from "@/core/config";
import { requireBusiness, type Business } from "@/core/profile/repo";
import { getSubscription, hasAccess } from "./repo";

let _stripe: Stripe | null = null;
export function stripe() {
  _stripe ??= new Stripe(config.stripeSecretKey!);
  return _stripe;
}

/** Gate for every paid tool's layout: signed in + business set up + subscribed. */
export async function requirePaid(): Promise<Business> {
  const biz = await requireBusiness();
  if (!hasAccess(await getSubscription(biz.id))) redirect("/billing?locked=1");
  return biz;
}
