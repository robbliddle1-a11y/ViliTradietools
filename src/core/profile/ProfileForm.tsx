"use client";
import { useActionState, useRef, useState } from "react";
import { Button, Card, Choice, Field, Input, Notice } from "@/core/ui";
import { shrinkImage } from "@/core/ui/image";
import { saveProfileAction, type ProfileState } from "./actions";
import { formatAbn, isValidAbn } from "./validate";

type Initial = {
  name?: string | null;
  abn?: string | null;
  qbcc_licence?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  gst_registered?: boolean;
};

export function ProfileForm({ initial, submitLabel }: { initial: Initial; submitLabel: string }) {
  const [state, act, pending] = useActionState<ProfileState, FormData>(saveProfileAction, {});
  const [abn, setAbn] = useState(initial.abn ? formatAbn(initial.abn) : "");
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logoUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const abnDigits = abn.replace(/\D/g, "");
  const abnLive = abnDigits.length === 11 ? (isValidAbn(abnDigits) ? "ok" : "bad") : null;
  const e = state.errors ?? {};

  async function onLogo(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const small = await shrinkImage(f, 600, 0.9);
    const dt = new DataTransfer();
    dt.items.add(small);
    ev.target.files = dt.files;
    setLogoPreview(URL.createObjectURL(small));
  }

  return (
    <form action={act} className="space-y-4">
      {state.saved && <Notice tone="success" title="Saved" />}

      <Card className="p-5 space-y-5">
        <h2 className="font-display text-[20px] font-[700]">Your business</h2>
        <Field label="Business name" hint="Exactly as it should appear on documents" error={e.name}>
          <Input name="name" defaultValue={initial.name ?? ""} autoComplete="organization" required />
        </Field>
        <Field
          label="ABN"
          error={e.abn ?? (abnLive === "bad" ? "That ABN doesn't check out. Have another look." : undefined)}
          hint={abnLive === "ok" ? "✓ Looks right" : "11 digits"}
        >
          <Input
            name="abn"
            value={abn}
            onChange={(ev) => setAbn(ev.target.value)}
            onBlur={() => setAbn(formatAbn(abn))}
            inputMode="numeric"
            placeholder="12 345 678 901"
          />
        </Field>
        <Field label="QBCC licence number" hint="Shows on every variation and claim" error={e.qbcc_licence}>
          <Input name="qbcc_licence" defaultValue={initial.qbcc_licence ?? ""} inputMode="numeric" placeholder="e.g. 1234567" />
        </Field>

        <div>
          <span className="block text-[15px] font-semibold mb-1.5">Registered for GST?</span>
          <Choice
            name="gst_registered"
            defaultValue={initial.gst_registered === false ? "no" : "yes"}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          <span className="block text-[15px] text-muted mt-1.5">Decides whether GST is added to your variations</span>
        </div>

        <div>
          <span className="block text-[15px] font-semibold mb-1.5">Logo</span>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 rounded-md border-2 border-dashed border-line-strong bg-card grid place-items-center overflow-hidden">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Your logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-muted text-[13px]">No logo</span>
              )}
            </div>
            <Button type="button" variant="secondary" size="md" onClick={() => fileRef.current?.click()}>
              {logoPreview ? "Change logo" : "Add logo"}
            </Button>
            <input ref={fileRef} type="file" name="logo" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onLogo} />
          </div>
          {e.logo && <p role="alert" className="text-[15px] text-declined mt-1.5">{e.logo}</p>}
        </div>
      </Card>

      <Card className="p-5 space-y-5">
        <h2 className="font-display text-[20px] font-[700]">Contact details</h2>
        <p className="text-[15px] text-muted -mt-3">Clients see these on documents you send.</p>
        <Field label="Your name">
          <Input name="contact_name" defaultValue={initial.contact_name ?? ""} autoComplete="name" />
        </Field>
        <Field label="Phone">
          <Input name="phone" type="tel" inputMode="tel" defaultValue={initial.phone ?? ""} autoComplete="tel" />
        </Field>
        <Field label="Email" error={e.email}>
          <Input name="email" type="email" inputMode="email" defaultValue={initial.email ?? ""} autoComplete="email" />
        </Field>
        <Field label="Business address">
          <Input name="address" defaultValue={initial.address ?? ""} autoComplete="street-address" />
        </Field>
      </Card>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-paper/95 backdrop-blur border-t border-line">
        <Button variant="accent" block disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
