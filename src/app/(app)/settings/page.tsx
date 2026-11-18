import { requireBusiness } from "@/core/profile/repo";
import { ProfileForm } from "@/core/profile/ProfileForm";
import { AppHeader, initialsFor, Page } from "@/core/shell/AppHeader";
import { prettyAuMobile } from "@/core/auth/identity";

export const metadata = { title: "Business details" };

export default async function Settings() {
  const biz = await requireBusiness();
  return (
    <>
      <AppHeader initials={initialsFor(biz.contact_name ?? biz.name)} back={{ href: "/home", label: "Back to tools" }}>
        <h1 className="font-display text-[26px] font-[750] tracking-[-0.02em]">Business details</h1>
      </AppHeader>
      <Page>
        <ProfileForm
          submitLabel="Save changes"
          initial={{
            ...biz,
            phone: biz.phone?.startsWith("+61") ? prettyAuMobile(biz.phone) : biz.phone,
            logoUrl: biz.logo_key ? `/api/files/${biz.logo_key}` : null,
          }}
        />
      </Page>
    </>
  );
}
