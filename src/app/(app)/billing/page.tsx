import { requireBusiness } from "@/core/profile/repo";
import { getSubscription, hasAccess } from "@/core/billing/repo";
import { manageBillingAction, subscribeAction } from "@/core/billing/actions";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { tools } from "@/core/brand";
import { config, live } from "@/core/config";
import { Button, Card, Notice } from "@/core/ui";

export const metadata = { title: "Subscription" };

export default async function Billing({ searchParams }: { searchParams: Promise<{ locked?: string }> }) {
  const biz = await requireBusiness();
  const sub = await getSubscription(biz.id);
  const active = hasAccess(sub);
  const { locked } = await searchParams;

  return (
    <>
      <AppHeader initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: "/home", label: "Back to tools" }}>
        <h1 className="font-display text-[26px] font-[750] tracking-[-0.02em]">Subscription</h1>
      </AppHeader>
      <Page>
        {locked && !active && <Notice tone="info" title="That tool's part of the paid plan" />}
        {sub?.status === "past_due" && (
          <Notice tone="warning" title="Your last payment didn't go through">
            Update your card to keep access.
          </Notice>
        )}

        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[24px] font-[750] tracking-[-0.02em]">Level Pro</p>
              <p className="text-muted">{config.priceLabel}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[13px] font-bold ${active ? "bg-approved-bg text-approved" : "bg-line text-muted"}`}>
              {active ? "Active" : "Not subscribed"}
            </span>
          </div>
          <ul className="space-y-2">
            {tools.filter((t) => t.paid).map((t) => (
              <li key={t.id} className="flex gap-3">
                <span className="text-approved font-bold" aria-hidden>✓</span>
                <span>
                  <span className="font-semibold">{t.name}</span>
                  {!t.ready && <span className="text-muted text-[14px]"> · coming soon</span>}
                  <span className="block text-[15px] text-muted">{t.blurb}</span>
                </span>
              </li>
            ))}
          </ul>
          {active ? (
            <form action={manageBillingAction}>
              <Button variant="secondary" block>{live.stripe ? "Manage card, invoices or cancel" : "Cancel (test mode)"}</Button>
            </form>
          ) : (
            <form action={subscribeAction}>
              <Button variant="accent" block>{live.stripe ? "Subscribe" : "Subscribe (test mode, no charge)"}</Button>
            </form>
          )}
          <p className="text-[13px] text-muted">Cancel any time. Prices in AUD.</p>
        </Card>
      </Page>
    </>
  );
}
