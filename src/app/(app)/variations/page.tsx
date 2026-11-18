import Link from "next/link";
import { requireBusiness } from "@/core/profile/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { buttonClass, Card, Input, Money } from "@/core/ui";
import { listJobs } from "@/tools/variations/repo";

export const metadata = { title: "Variations" };

export default async function JobsList({ searchParams }: { searchParams: Promise<{ q?: string; archived?: string }> }) {
  const biz = await requireBusiness();
  const { q, archived } = await searchParams;
  const jobs = await listJobs(biz.id, { q: q?.trim() || undefined, archived: archived === "1" });

  return (
    <>
      <AppHeader tool="Variations" initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: "/home", label: "All tools" }}>
        <h1 className="font-display text-[28px] font-[750] tracking-[-0.02em]">{archived ? "Archived jobs" : "Jobs"}</h1>
      </AppHeader>
      <Page>
        {!archived && (
          <Link href="/variations/jobs/new" className={buttonClass("accent", "lg", true)}>
            <span className="text-[22px] leading-none" aria-hidden>+</span> New job
          </Link>
        )}

        {(jobs.length > 4 || q) && (
          <form role="search">
            {archived && <input type="hidden" name="archived" value="1" />}
            <Input name="q" type="search" defaultValue={q} placeholder="Search client, job or address" aria-label="Search jobs" />
          </form>
        )}

        {jobs.length === 0 ? (
          <Card className="p-6 text-center space-y-1">
            <p className="font-semibold text-[18px]">{q ? "No jobs match that" : archived ? "Nothing archived" : "No jobs yet"}</p>
            {!q && !archived && <p className="text-muted">Add the job once, then record variations on site in a minute each.</p>}
          </Card>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link href={`/variations/jobs/${j.id}`} className="block">
                  <Card className="p-4 active:scale-[0.99] transition-transform">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[18px] truncate">{j.name}</p>
                        <p className="text-[15px] text-muted truncate">{j.site_address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Money cents={j.contract_price_cents + j.approved_cents} className="font-semibold" />
                        <p className="text-[13px] text-muted">
                          {j.variation_count} variation{j.variation_count === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    {j.pending_count > 0 && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pending-bg text-pending px-3 py-1 text-[14px] font-semibold">
                        <span className="h-2 w-2 rounded-full bg-pending" aria-hidden />
                        {j.pending_count} waiting on client · <Money cents={j.pending_cents} signed />
                      </p>
                    )}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center pt-2">
          <Link href={archived ? "/variations" : "/variations?archived=1"} className="inline-block py-3 px-4 text-muted underline underline-offset-4">
            {archived ? "← Back to current jobs" : "Archived jobs"}
          </Link>
        </p>
      </Page>
    </>
  );
}
