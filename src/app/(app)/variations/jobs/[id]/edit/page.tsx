import { notFound } from "next/navigation";
import { requireBusiness } from "@/core/profile/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { prettyAuMobile } from "@/core/auth/identity";
import { centsToInput } from "@/core/money";
import { Button } from "@/core/ui";
import { JobForm } from "@/tools/variations/JobForm";
import { archiveJobAction } from "@/tools/variations/job-actions";
import { getJob } from "@/tools/variations/repo";

export const metadata = { title: "Edit job" };

export default async function EditJob({ params }: { params: Promise<{ id: string }> }) {
  const biz = await requireBusiness();
  const { id } = await params;
  const job = await getJob(biz.id, id);
  if (!job) notFound();

  return (
    <>
      <AppHeader tool="Variations" initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: `/variations/jobs/${id}`, label: "Back to job" }}>
        <h1 className="font-display text-[28px] font-[750] tracking-[-0.02em]">Edit job</h1>
      </AppHeader>
      <Page>
        <JobForm
          initial={{
            id: job.id,
            name: job.name,
            client_name: job.client_name,
            client_email: job.client_email ?? "",
            client_phone: job.client_phone ? prettyAuMobile(job.client_phone) : "",
            site_address: job.site_address,
            contract_price: centsToInput(job.contract_price_cents),
            contract_date: job.contract_date ?? "",
            is_domestic: job.is_domestic,
          }}
        />
        <form action={archiveJobAction} className="pt-2">
          <input type="hidden" name="id" value={job.id} />
          <input type="hidden" name="archive" value={job.archived_at ? "0" : "1"} />
          <Button variant="ghost" block size="md">
            {job.archived_at ? "Unarchive job" : "Archive job"}
          </Button>
        </form>
      </Page>
    </>
  );
}
