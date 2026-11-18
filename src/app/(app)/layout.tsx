import { requireUser } from "@/core/auth/server";

/** Everything in (app) needs a signed-in user. Business + subscription checks happen per page/tool. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <div className="flex-1 flex flex-col">{children}</div>;
}
