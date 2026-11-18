import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusiness } from "@/core/profile/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { prettyAuMobile } from "@/core/auth/identity";
import { buttonClass, Card, Money, Notice, StatusPill } from "@/core/ui";
import { getJob, listVariations, type Variation } from "@/tools/variations/repo";
import { contractTotals } from "@/tools/variations/totals";

export const metadata = { title: "Job" };

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Brisbane" });

function when(v: Variation) {
  if (v.status === "signed" && v.decided_at) return `Signed ${dateFmt.format(v.decided_at)}`;
  if (v.status === "declined" && v.decided_at) return `Declined ${dateFmt.format(v.decided_at)}`;
  if (v.status === "sent" && v.sent_at) return `Sent ${dateFmt.format(v.sent_at)}`;
  return `Started ${dateFmt.format(v.created_at)}`;
}

function days(n: number) {
  if (n === 0) return "no time change";
  return `${n > 0 ? "+" : "−"}${Math.abs(n)} day${Math.abs(n) === 1 ? "" : "s"}`;
}

export default async function JobPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const biz = await requireBusiness();
  const { id } = await params;
  const job = await getJob(biz.id, id);
  if (!job) notFound();
  const variations = await listVariations(biz.id, id);
  const t = contractTotals(job.contract_price_cents, variations);
  const { new: isNew } = await searchParams;

  const groups: { title: string; items: Variation[] }[] = [
    { title: "Waiting on client", items: variations.filter((v) => v.status === "sent") },
    { title: "Drafts", items: variations.filter((v) => v.status === "draft") },
    { title: "Signed", items: variations.filter((v) => v.status === "signed") },
    { title: "Declined", items: variations.filter((v) => v.status === "declined" || v.status === "withdrawn") },
  ];

  return (
    <>
      <AppHeader tool="Variations" initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: "/variations", label: "Jobs" }}>
        <p className="text-on-ink/70 text-[15px]">{job.site_address}</p>
        <h1 className="font-display text-[28px] font-[750] tracking-[-0.02em] leading-tight">{job.name}</h1>
        <div className="mt-4 rounded-md bg-ink-2 p-4">
          <p className="text-[13px] uppercase tracking-[0.1em] text-on-ink/60 font-semibold">Contract total</p>
          <p className="font-display text-[36px] font-[750] leading-tight">
            <Money cents={t.current} />
          </p>
          <dl className="mt-1 grid grid-cols-2 gap-x-4 text-[14px] text-on-ink/75">
            <dt>Original</dt>
            <dd className="text-right"><Money cents={t.original} /></dd>
            <dt>Signed variations</dt>
            <dd className="text-right"><Money cents={t.approved} signed /></dd>
            {t.approvedDays !== 0 && (
              <>
                <dt>Time added</dt>
                <dd className="text-right num">{days(t.approvedDays)}</dd>
              </>
            )}
          </dl>
          {t.pendingCount > 0 && (
            <p className="mt-3 rounded-sm bg-pending-bg text-pending px-3 py-2 text-[14px] font-semibold">
              {t.pendingCount} waiting on client (<Money cents={t.pending} signed />). If signed, total becomes{" "}
              <Money cents={t.ifAllSigned} />
            </p>
          )}
        </div>
      </AppHeader>

      <Page>
        {isNew && <Notice tone="success" title="Job saved. Add a variation whenever something changes." />}
        {job.archived_at && <Notice tone="info" title="This job is archived" />}

        <Link href={`/variations/jobs/${job.id}/new`} className={buttonClass("accent", "lg", true)}>
          <span className="text-[22px] leading-none" aria-hidden>+</span> New variation
        </Link>

        {variations.length === 0 && (
          <Card className="p-6 text-center space-y-1">
            <p className="font-semibold text-[18px]">No variations yet</p>
            <p className="text-muted">When the client asks for something extra (or less), record it here and get it signed before you start.</p>
          </Card>
        )}

        {groups.map(
          (g) =>
            g.items.length > 0 && (
              <section key={g.title} className="space-y-2">
                <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-muted">{g.title}</h2>
                <ul className="space-y-2">
                  {g.items.map((v) => (
                    <li key={v.id}>
                      <Card className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold">
                              <span className="text-muted">V{v.number}</span> · {v.title}
                            </p>
                            <p className="text-[14px] text-muted">
                              {when(v)} · {days(v.days_delta)}
                            </p>
                          </div>
                          <Money cents={v.amount_inc_cents} signed className="font-semibold" />
                        </div>
                        <div className="mt-3">
                          <StatusPill status={v.status} />
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ),
        )}

        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] uppercase tracking-[0.1em] text-muted font-semibold">Client</p>
              <p className="font-semibold text-[18px]">{job.client_name}</p>
              <p className="text-[14px] text-muted">
                {job.is_domestic ? "Residential (domestic building contract)" : "Commercial"}
                {job.contract_date && ` · contract ${new Date(job.contract_date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            </div>
            <Link href={`/variations/jobs/${job.id}/edit`} className={buttonClass("secondary", "md")}>
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.client_phone && (
              <>
                <a href={`tel:${job.client_phone}`} className={buttonClass("secondary", "md")}>📞 {prettyAuMobile(job.client_phone)}</a>
                <a href={`sms:${job.client_phone}`} className={buttonClass("secondary", "md")}>Text</a>
              </>
            )}
            {job.client_email && (
              <a href={`mailto:${job.client_email}`} className={buttonClass("secondary", "md", false, "max-w-full truncate")}>✉ {job.client_email}</a>
            )}
          </div>
        </Card>
      </Page>
    </>
  );
}
