import { redirect } from "next/navigation";
import { brand } from "@/core/brand";
import { getUser } from "@/core/auth/server";
import { LoginForm } from "@/core/auth/LoginForm";
import { Wordmark } from "@/core/ui";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/home");
  return (
    <main className="flex-1 flex flex-col">
      <div className="bg-ink text-on-ink px-6 pt-10 pb-12">
        <Wordmark inverted />
        <p className="mt-6 font-display text-[22px] font-[650] leading-snug max-w-xs">{brand.tagline}</p>
      </div>
      <div className="-mt-6 flex-1 rounded-t-[28px] bg-paper px-6 pt-8 pb-10 max-w-md w-full mx-auto">
        <LoginForm />
      </div>
    </main>
  );
}
