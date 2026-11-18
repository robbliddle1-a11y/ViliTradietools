import Link from "next/link";
import { requireBusiness } from "@/core/profile/repo";
import { getSubscription, hasAccess } from "@/core/billing/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { ToolGrid } from "@/core/shell/ToolGrid";
import { buttonClass, Notice } from "@/core/ui";
import { live, config } from "@/core/config";

export const metadata = { title: "Tools" };

export default async function Home({ searchParams }: { searchParams: Promise<{ welcome?: string; subscribed?: string }> }) {
  const biz = await requireBusiness();
  const subscribed = hasAccess(await getSubscription(biz.id));
  const sp = await searchParams;
  const first = (biz.contact_name ?? "").split(" ")[0];

  return (
    <>
      <AppHeader initials={initialsFor(biz.contact_name ?? biz.name)}>
        <p className="text-on-ink/70 text-[15px]">{biz.name}</p>
        <h1 className="font-display text-[28px] font-[750] tracking-[-0.02em] leading-tight">
          {first ? `G'day ${first}` : "G'day"}
        </h1>
      </AppHeader>
      <Page>
        {sp.welcome && <Notice tone="success" title="You're set up. Your details will go on every document." />}
        {sp.subscribed && <Notice tone="success" title="Subscription active. All paid tools unlocked." />}
        {!subscribed && (
          <div className="rounded-lg bg-ink text-on-ink p-5 space-y-3">
            <p className="font-display text-[22px] font-[700] leading-snug">Unlock all four paid tools</p>
            <p className="text-on-ink/75 text-[15px]">
              Variations, Compliance Wallet, SWMS Builder and Payment Claims. One subscription, {config.priceLabel}.
            </p>
            <Link href="/billing" className={buttonClass("accent", "lg", true)}>
              See plan
            </Link>
          </div>
        )}
        <ToolGrid subscribed={subscribed} />
        {(!live.db || !live.auth || !live.stripe) && (
          <p className="text-[13px] text-muted text-center pt-4">
            Test mode · {[!live.db && "local database", !live.auth && "mock login codes", !live.stripe && "mock payments"].filter(Boolean).join(" · ")}
          </p>
        )}
      </Page>
    </>
  );
}
