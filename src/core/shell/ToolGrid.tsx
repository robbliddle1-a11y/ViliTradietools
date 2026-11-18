import Link from "next/link";
import { tools } from "@/core/brand";
import { cn } from "@/core/ui";

/** Suite home grid, built from the tool registry in core/brand.ts. */
export function ToolGrid({ subscribed }: { subscribed: boolean }) {
  const paid = tools.filter((t) => t.paid);
  const free = tools.filter((t) => !t.paid);
  return (
    <div className="space-y-6">
      <ToolList title="Your tools" items={paid} subscribed={subscribed} />
      <ToolList title="Free calculators" items={free} subscribed={subscribed} />
    </div>
  );
}

function ToolList({ title, items, subscribed }: { title: string; items: typeof tools; subscribed: boolean }) {
  return (
    <section>
      <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-muted mb-2">{title}</h2>
      <ul className="space-y-2">
        {items.map((t) => {
          const locked = t.paid && !subscribed;
          const href = !t.ready ? undefined : locked ? "/billing" : t.href;
          const inner = (
            <div
              className={cn(
                "flex items-center gap-4 rounded-lg border border-line bg-card px-4 py-4 shadow-card min-h-[76px]",
                href && "active:scale-[0.99] transition-transform",
                !t.ready && "opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[18px]">{t.name}</p>
                <p className="text-[15px] text-muted leading-snug">{t.blurb}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold",
                  !t.ready ? "bg-line text-muted" : locked ? "bg-ink text-on-ink" : "bg-bubble text-ink",
                )}
              >
                {!t.ready ? "SOON" : locked ? "UNLOCK" : "OPEN →"}
              </span>
            </div>
          );
          return <li key={t.id}>{href ? <Link href={href}>{inner}</Link> : inner}</li>;
        })}
      </ul>
    </section>
  );
}
