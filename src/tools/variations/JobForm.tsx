"use client";
import { useActionState } from "react";
import { Button, Card, Choice, Field, Input, Notice } from "@/core/ui";
import { saveJobAction, type JobFormState } from "./job-actions";

export type JobFormInitial = {
  id?: string;
  name?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  site_address?: string;
  contract_price?: string;
  contract_date?: string;
  is_domestic?: boolean;
};

export function JobForm({ initial = {} }: { initial?: JobFormInitial }) {
  const [state, act, pending] = useActionState<JobFormState, FormData>(saveJobAction, {});
  const e = state.errors ?? {};
  // After a failed submit, keep what they typed (React resets uncontrolled forms on action).
  const v = (k: keyof JobFormInitial) => state.values?.[k] ?? (initial[k] as string | undefined) ?? "";

  return (
    <form action={act} className="space-y-4" key={JSON.stringify(state.values ?? {})}>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {e.form && <Notice tone="danger" title={e.form} />}

      <Card className="p-5 space-y-5">
        <h2 className="font-display text-[20px] font-[700]">Client</h2>
        <Field label="Client name" error={e.client_name}>
          <Input name="client_name" defaultValue={v("client_name")} autoComplete="off" autoCapitalize="words" />
        </Field>
        <Field label="Client mobile" hint="Variations get texted here" error={e.client_phone}>
          <Input name="client_phone" type="tel" inputMode="tel" defaultValue={v("client_phone")} placeholder="04xx xxx xxx" autoComplete="off" />
        </Field>
        <Field label="Client email" hint="Signed copies get emailed here" error={e.client_email}>
          <Input name="client_email" type="email" inputMode="email" defaultValue={v("client_email")} autoComplete="off" />
        </Field>
      </Card>

      <Card className="p-5 space-y-5">
        <h2 className="font-display text-[20px] font-[700]">Job</h2>
        <Field label="Site address" error={e.site_address}>
          <Input name="site_address" defaultValue={v("site_address")} autoComplete="off" autoCapitalize="words" />
        </Field>
        <Field label="Job name" hint="Optional. What you call it, e.g. “Nguyen bathroom reno”">
          <Input name="name" defaultValue={v("name")} autoCapitalize="sentences" />
        </Field>
        <Field label="Original contract price (inc GST)" error={e.contract_price}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-muted" aria-hidden>$</span>
            <Input name="contract_price" inputMode="decimal" defaultValue={v("contract_price")} placeholder="45,200" className="pl-9 num" />
          </div>
        </Field>
        <Field label="Contract date" error={e.contract_date}>
          <Input name="contract_date" type="date" defaultValue={v("contract_date")} />
        </Field>
        <div>
          <span className="block text-[15px] font-semibold mb-1.5">What kind of work?</span>
          <Choice
            name="is_domestic"
            defaultValue={(state.values?.is_domestic ?? (initial.is_domestic === false ? "no" : "yes")) as "yes" | "no"}
            options={[
              { value: "yes", label: "Residential", hint: "Home for a homeowner" },
              { value: "no", label: "Commercial", hint: "Or subbie to a builder" },
            ]}
          />
          <span className="block text-[15px] text-muted mt-1.5">
            Residential jobs follow the stricter QBCC domestic building rules for variations.
          </span>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-paper/95 backdrop-blur border-t border-line">
        <Button variant="accent" block disabled={pending}>
          {pending ? "Saving…" : initial.id ? "Save job" : "Create job"}
        </Button>
      </div>
    </form>
  );
}
