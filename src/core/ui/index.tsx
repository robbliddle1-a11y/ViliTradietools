/**
 * Level UI kit — shared, dependency-free components for every tool in the suite.
 * Rules: min 56px tap targets, 17px+ text, inputs at 18px (stops iOS zoom),
 * status never shown by colour alone (always a word or icon too).
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/* ---------- Logo ---------- */

/** The mark: a spirit-level vial with the bubble dead centre. */
export function LevelMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={className}>
      <rect x="2" y="12" width="44" height="24" rx="12" fill="var(--ink)" />
      <rect x="7" y="17" width="34" height="14" rx="7" fill="var(--ink-2)" />
      <line x1="17" y1="15" x2="17" y2="33" stroke="var(--on-ink)" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <line x1="31" y1="15" x2="31" y2="33" stroke="var(--on-ink)" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <circle cx="24" cy="24" r="5.5" fill="var(--bubble)" />
    </svg>
  );
}

export function Wordmark({ tool, inverted }: { tool?: string; inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LevelMark size={30} />
      <span className={cn("font-display text-[22px] font-[750] tracking-[-0.02em]", inverted ? "text-on-ink" : "text-ink")}>
        Level
        {tool && <span className={cn("font-[500]", inverted ? "text-on-ink/70" : "text-muted")}> {tool}</span>}
      </span>
    </span>
  );
}

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink active:bg-ink-2",
  accent: "bg-bubble text-ink active:bg-bubble-deep",
  secondary: "bg-card text-ink border-2 border-line-strong active:bg-paper",
  ghost: "bg-transparent text-ink active:bg-line/60",
  danger: "bg-declined text-white active:opacity-90",
};

/** Button look for links (`<Link className={buttonClass(...)}>`) — never nest a button in a link. */
export function buttonClass(variant: ButtonVariant = "primary", size: "lg" | "md" = "lg", block?: boolean, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold select-none transition-[background,transform] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
    size === "lg" ? "min-h-tap px-6 text-[18px]" : "min-h-tap-sm px-4 text-[16px]",
    block && "w-full",
    buttonStyles[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "lg",
  block,
  icon,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "lg" | "md";
  block?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      className={buttonClass(variant, size, block, className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------- Card ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-lg bg-card shadow-card border border-line", className)}>{children}</div>;
}

/* ---------- Fields ---------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[15px] font-semibold text-ink mb-1.5">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="block text-[15px] text-declined mt-1.5">{error}</span>
      ) : hint ? (
        <span className="block text-[15px] text-muted mt-1.5">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-md border-2 border-line-strong bg-card px-4 text-[18px] text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, "min-h-tap", className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputBase, "py-3 min-h-[120px]", className)} {...props} />;
}

/* ---------- Status ---------- */

export type Status = "draft" | "sent" | "signed" | "declined";

const statusMap: Record<Status, { label: string; cls: string; dot: string }> = {
  draft: { label: "Draft", cls: "bg-line/70 text-ink", dot: "bg-muted" },
  sent: { label: "Waiting on client", cls: "bg-pending-bg text-pending", dot: "bg-pending" },
  signed: { label: "Signed", cls: "bg-approved-bg text-approved", dot: "bg-approved" },
  declined: { label: "Declined", cls: "bg-declined-bg text-declined", dot: "bg-declined" },
};

export function StatusPill({ status }: { status: Status }) {
  const s = statusMap[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-semibold", s.cls)}>
      <span className={cn("h-2 w-2 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

/* ---------- Notice (warnings the app can't enforce) ---------- */

export function Notice({
  tone = "warning",
  title,
  children,
}: {
  tone?: "warning" | "info" | "danger" | "success";
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    warning: "bg-pending-bg border-pending text-ink",
    info: "bg-info-bg border-info text-ink",
    danger: "bg-declined-bg border-declined text-ink",
    success: "bg-approved-bg border-approved text-ink",
  } as const;
  const icon = { warning: "⚠", info: "ℹ", danger: "✕", success: "✓" }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-md border-l-[6px] px-4 py-3", tones[tone])}>
      <p className="font-semibold flex gap-2">
        <span aria-hidden>{icon}</span>
        {title}
      </p>
      {children && <div className="text-[15px] mt-1 text-ink/85">{children}</div>}
    </div>
  );
}

/* ---------- Money ---------- */

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

/** Format cents as AUD. Money is always stored as integer cents. */
export function Money({ cents, signed, className }: { cents: number; signed?: boolean; className?: string }) {
  const sign = signed && cents > 0 ? "+" : cents < 0 ? "−" : "";
  return <span className={cn("num whitespace-nowrap", className)}>{sign}{aud.format(Math.abs(cents) / 100)}</span>;
}
