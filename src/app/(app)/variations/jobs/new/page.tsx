import { requireBusiness } from "@/core/profile/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { JobForm } from "@/tools/variations/JobForm";

export const metadata = { title: "New job" };

export default async function NewJob() {
  const biz = await requireBusiness();
  return (
    <>
      <AppHeader tool="Variations" initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: "/variations", label: "Jobs" }}>
        <h1 className="font-display text-[28px] font-[750] tracking-[-0.02em]">New job</h1>
      </AppHeader>
      <Page>
        <JobForm />
      </Page>
    </>
  );
}
