import { requireBusiness } from "@/core/profile/repo";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { Notice } from "@/core/ui";

export const metadata = { title: "Variations" };

// Stage 1 placeholder — proves the paywall. Jobs land here in Stage 2.
export default async function VariationsHome() {
  const biz = await requireBusiness();
  return (
    <>
      <AppHeader tool="Variations" initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: "/home", label: "All tools" }} />
      <Page>
        <Notice tone="info" title="You're in. Jobs and variations arrive in Stage 2." />
      </Page>
    </>
  );
}
