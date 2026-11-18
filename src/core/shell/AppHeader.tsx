import Link from "next/link";
import { logoutAction } from "@/core/auth/actions";
import { Wordmark } from "@/core/ui";

/**
 * The suite's top bar. Every tool renders this with its own `tool` name and an
 * optional `back` link, so moving between tools feels like one app.
 */
export function AppHeader({
  tool,
  back,
  initials,
  children,
}: {
  tool?: string;
  back?: { href: string; label: string };
  initials: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="bg-ink text-on-ink">
      <div className="mx-auto max-w-2xl px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 min-w-0">
          {back && (
            <Link
              href={back.href}
              aria-label={back.label}
              className="-ml-2 h-12 w-12 grid place-items-center rounded-full text-[24px] active:bg-ink-2"
            >
              ←
            </Link>
          )}
          <Link href="/home" className="min-h-12 flex items-center">
            <Wordmark tool={tool} inverted />
          </Link>
        </div>
        <details className="relative">
          <summary
            aria-label="Account menu"
            className="list-none h-11 w-11 rounded-full bg-ink-2 grid place-items-center text-[14px] font-bold cursor-pointer [&::-webkit-details-marker]:hidden"
          >
            {initials}
          </summary>
          <nav className="absolute right-0 mt-2 w-56 rounded-md bg-card text-ink shadow-xl border border-line overflow-hidden z-20">
            <Link href="/home" className="block px-4 py-3.5 active:bg-paper">All tools</Link>
            <Link href="/settings" className="block px-4 py-3.5 active:bg-paper border-t border-line">Business details</Link>
            <Link href="/billing" className="block px-4 py-3.5 active:bg-paper border-t border-line">Subscription</Link>
            <form action={logoutAction} className="border-t border-line">
              <button className="w-full text-left px-4 py-3.5 text-declined active:bg-paper">Log out</button>
            </form>
          </nav>
        </details>
      </div>
      {children && <div className="mx-auto max-w-2xl px-4 pb-5">{children}</div>}
    </header>
  );
}

export function initialsFor(name?: string | null, fallback = "Me") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || fallback;
}

export function Page({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-2xl w-full px-4 py-5 pb-[max(env(safe-area-inset-bottom),20px)] space-y-4">{children}</main>;
}
