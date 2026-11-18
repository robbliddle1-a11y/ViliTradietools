import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusiness } from "@/core/profile/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { buttonClass, Notice } from "@/core/ui";
import { getJob } from "@/tools/variations/repo";

// Stage 3 replaces this with the on-site capture flow.
export default async function NewVariation({ params }: { params: Promise<{ id: string }> }) {
  const biz = await requireBusiness();
  const { id } = await params;
  const job = await getJob(biz.id, id);
  if (!job) notFound();
  return (
    <>
      <AppHeader tool="Variations" initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: `/variations/jobs/${id}`, label: "Back to job" }} />
      <Page>
        <Notice tone="info" title="Recording variations arrives in Stage 3" />
        <Link href={`/variations/jobs/${id}`} className={buttonClass("secondary", "lg", true)}>Back to job</Link>
      </Page>
    </>
  );
}
