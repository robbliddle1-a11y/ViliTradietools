import type { ReactNode } from "react";
import { brand, tools } from "@/core/brand";
import { Button, Card, Field, Input, LevelMark, Money, Notice, StatusPill, TextArea, Wordmark } from "@/core/ui";

export const metadata = { title: "Style guide" };

const swatches = [
  { name: "Ink", v: "--ink", hex: "#0E1A24", use: "Text, headers, primary buttons" },
  { name: "Bubble", v: "--bubble", hex: "#C5EE3A", use: "Accent fill — the one thing to tap" },
  { name: "Paper", v: "--paper", hex: "#F5F4EF", use: "Background — low glare in sun" },
  { name: "Card", v: "--card", hex: "#FFFFFF", use: "Cards, inputs" },
  { name: "Muted", v: "--muted", hex: "#56626B", use: "Secondary text" },
  { name: "Approved", v: "--approved", hex: "#157A3A", use: "Signed / approved" },
  { name: "Pending", v: "--pending", hex: "#A35F00", use: "Waiting on client" },
  { name: "Declined", v: "--declined", hex: "#B8322B", use: "Declined / errors" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

/** Sample screen: the job page, to judge the look in context. */
function PhoneMock() {
  return (
    <div className="mx-auto w-[360px] rounded-[44px] border-[10px] border-ink bg-paper overflow-hidden shadow-2xl">
      <header className="bg-ink px-5 pt-6 pb-5 text-on-ink">
        <div className="flex items-center justify-between">
          <Wordmark tool="Variations" inverted />
          <span className="h-9 w-9 rounded-full bg-ink-2 grid place-items-center text-[14px] font-bold">RK</span>
        </div>
        <p className="mt-5 text-on-ink/70 text-[14px]">14 Kedron Brook Rd, Wilston</p>
        <h3 className="font-display text-[26px] font-[750] tracking-[-0.02em] leading-tight">Nguyen bathroom reno</h3>
        <div className="mt-4 rounded-md bg-ink-2 p-4">
          <p className="text-[13px] uppercase tracking-[0.1em] text-on-ink/60 font-semibold">Contract total</p>
          <p className="font-display text-[34px] font-[750] num">
            <Money cents={4_837_000} />
          </p>
          <p className="text-[14px] text-on-ink/70 num">
            Original <Money cents={4_520_000} /> · Approved <Money cents={317_000} signed />
          </p>
        </div>
      </header>
      <div className="p-4 space-y-3">
        <Button variant="accent" block icon={<span className="text-[22px] leading-none">+</span>}>
          New variation
        </Button>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">V3 · Move shower waste 600mm</p>
              <p className="text-[14px] text-muted">Sent 2h ago · +2 days</p>
            </div>
            <Money cents={185_000} signed className="font-semibold" />
          </div>
          <div className="mt-3"><StatusPill status="sent" /></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">V2 · Upgrade to 600×1200 tiles</p>
              <p className="text-[14px] text-muted">Signed 3 Nov · +1 day</p>
            </div>
            <Money cents={262_000} signed className="font-semibold" />
          </div>
          <div className="mt-3"><StatusPill status="signed" /></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">V1 · Delete heated towel rail</p>
              <p className="text-[14px] text-muted">Signed 28 Oct · 0 days</p>
            </div>
            <Money cents={-55_000} signed className="font-semibold" />
          </div>
          <div className="mt-3"><StatusPill status="signed" /></div>
        </Card>
      </div>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 space-y-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <LevelMark size={72} />
          <h1 className="font-display text-[56px] md:text-[80px] font-[800] tracking-[-0.035em] leading-[0.95]">
            {brand.name}
          </h1>
          <p className="text-[20px] text-muted max-w-md">{brand.tagline}</p>
        </div>
        <p className="text-[15px] text-muted max-w-sm">
          Proposed brand for the ViLi tradie suite. The mark is a spirit-level vial with the bubble dead centre:
          everything square, true and signed off. Bubble lime is the one accent, used only for the main action on a screen.
        </p>
      </header>

      <div className="grid gap-14 lg:grid-cols-[1fr_380px]">
        <div className="space-y-14">
          <Section title="Colour">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {swatches.map((s) => (
                <div key={s.name} className="rounded-md overflow-hidden border border-line bg-card">
                  <div className="h-20" style={{ background: `var(${s.v})` }} />
                  <div className="p-3">
                    <p className="font-semibold text-[15px]">{s.name}</p>
                    <p className="text-[13px] text-muted num">{s.hex}</p>
                    <p className="text-[13px] text-muted mt-1 leading-snug">{s.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Type — Archivo (display) + Inter (body)">
            <Card className="p-6 space-y-3">
              <p className="font-display text-[40px] font-[800] tracking-[-0.03em] leading-none">Get it signed first.</p>
              <p className="font-display text-[26px] font-[750] tracking-[-0.02em]">Nguyen bathroom reno</p>
              <p className="text-[17px]">Body copy is 17px Inter. Plain words a tradie would actually say: no jargon, no fluff.</p>
              <p className="text-[15px] text-muted">Secondary text, 15px, still AA contrast on paper.</p>
              <p className="font-display text-[34px] font-[750] num"><Money cents={4_837_000} /></p>
            </Card>
          </Section>

          <Section title="Buttons — 56px tall minimum">
            <div className="flex flex-wrap gap-3">
              <Button variant="accent">Send to client</Button>
              <Button>Save variation</Button>
              <Button variant="secondary">Add photo</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="danger">Decline</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Section>

          <Section title="Fields — 18px input text (no iOS zoom)">
            <Card className="p-6 grid gap-5 sm:grid-cols-2">
              <Field label="Client name">
                <Input placeholder="e.g. Linh Nguyen" />
              </Field>
              <Field label="Mobile" hint="We'll text the variation here">
                <Input inputMode="tel" placeholder="04xx xxx xxx" />
              </Field>
              <Field label="ABN" error="That ABN doesn't check out. Have another look.">
                <Input defaultValue="51 824 753 55" inputMode="numeric" />
              </Field>
              <Field label="Extra days" hint="Effect on the completion date">
                <Input type="number" inputMode="numeric" defaultValue={2} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="What's changing?">
                  <TextArea placeholder="Tap the mic and just say it…" />
                </Field>
              </div>
            </Card>
          </Section>

          <Section title="Status — always a word, never colour alone">
            <div className="flex flex-wrap gap-2">
              <StatusPill status="draft" />
              <StatusPill status="sent" />
              <StatusPill status="signed" />
              <StatusPill status="declined" />
            </div>
          </Section>

          <Section title="Notices — for things the app can't enforce">
            <div className="space-y-3">
              <Notice title="Don't start this work until it's signed">
                Sample copy only. Final wording comes from the Schedule 1B check in Stage 4. The app can&apos;t stop
                you picking up the tools, so that part&apos;s on you.
              </Notice>
              <Notice tone="info" title="Template tool, not legal advice">
                Level helps you follow a workflow. If a variation is disputed, talk to a lawyer or QBCC.
              </Notice>
              <Notice tone="success" title="Signed by Linh Nguyen, 2:14 pm today" />
              <Notice tone="danger" title="Declined: “Can we talk about the price first?”" />
            </div>
          </Section>

          <Section title="Suite tools">
            <div className="grid sm:grid-cols-2 gap-3">
              {tools.map((t) => (
                <Card key={t.id} className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-[14px] text-muted">{t.blurb}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold ${t.paid ? "bg-ink text-on-ink" : "bg-bubble text-ink"}`}>
                    {t.paid ? "PRO" : "FREE"}
                  </span>
                </Card>
              ))}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-8 self-start space-y-3">
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-muted text-center">In context</h2>
          <PhoneMock />
        </aside>
      </div>
    </main>
  );
}
