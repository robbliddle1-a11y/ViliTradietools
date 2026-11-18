import { redirect } from "next/navigation";
import { requireUser } from "@/core/auth/server";
import { getBusinessForUser } from "@/core/profile/repo";
import { ProfileForm } from "@/core/profile/ProfileForm";
import { Page } from "@/core/shell/AppHeader";
import { Wordmark } from "@/core/ui";
import { prettyAuMobile } from "@/core/auth/identity";

export const metadata = { title: "Set up your business" };

export default async function Onboarding() {
  const user = await requireUser();
  if (await getBusinessForUser(user.id)) redirect("/home");
  return (
    <>
      <header className="bg-ink text-on-ink px-4 pt-6 pb-6">
        <div className="mx-auto max-w-2xl">
          <Wordmark inverted />
          <h1 className="mt-5 font-display text-[28px] font-[750] tracking-[-0.02em] leading-tight">Set up your business</h1>
          <p className="text-on-ink/75 mt-1">Do this once. It goes on every variation, SWMS and claim you send.</p>
        </div>
      </header>
      <Page>
        <ProfileForm
          submitLabel="Save and continue"
          initial={{ phone: user.phone ? prettyAuMobile(user.phone) : null, email: user.email }}
        />
      </Page>
    </>
  );
}
