"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePaid } from "@/core/billing/server";
import { normaliseAuMobile, normaliseEmail } from "@/core/auth/identity";
import { parseDollars } from "@/core/money";
import { createJob, getJob, setJobArchived, updateJob, type JobInput } from "./repo";

export type JobFormState = { errors?: Record<string, string>; values?: Record<string, string> };

function parse(form: FormData): { input?: JobInput; errors: Record<string, string>; values: Record<string, string> } {
  const values: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") values[k] = v;
  const s = (k: string) => (values[k] ?? "").trim();
  const errors: Record<string, string> = {};

  const name = s("name");
  const client_name = s("client_name");
  const site_address = s("site_address");
  if (!client_name) errors.client_name = "Who's the client?";
  if (!site_address) errors.site_address = "Where's the job?";

  const emailRaw = s("client_email");
  const client_email = emailRaw ? normaliseEmail(emailRaw) : null;
  if (emailRaw && !client_email) errors.client_email = "That email doesn't look right.";

  const phoneRaw = s("client_phone");
  const client_phone = phoneRaw ? normaliseAuMobile(phoneRaw) : null;
  if (phoneRaw && !client_phone) errors.client_phone = "Needs to be an Aussie mobile (04xx xxx xxx) so we can text them.";

  if (!client_email && !client_phone && !errors.client_email && !errors.client_phone)
    errors.client_phone = "Add a mobile or an email, so you can send them variations.";

  const price = parseDollars(s("contract_price"));
  if (price === null || price < 0) errors.contract_price = "Enter the contract price, e.g. 45,200";

  const date = s("contract_date");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.contract_date = "Pick a date.";

  if (Object.keys(errors).length) return { errors, values };
  return {
    errors,
    values,
    input: {
      name: name || `${client_name}, ${site_address.split(",")[0]}`,
      client_name,
      client_email,
      client_phone,
      site_address,
      contract_price_cents: price!,
      contract_date: date || null,
      is_domestic: s("is_domestic") !== "no",
    },
  };
}

export async function saveJobAction(_: JobFormState, form: FormData): Promise<JobFormState> {
  const biz = await requirePaid();
  const { input, errors, values } = parse(form);
  if (!input) return { errors, values };

  const id = String(form.get("id") ?? "");
  if (id) {
    if (!(await getJob(biz.id, id))) return { errors: { form: "Job not found." } };
    await updateJob(biz.id, id, input);
    revalidatePath(`/variations`);
    redirect(`/variations/jobs/${id}`);
  }
  const newId = await createJob(biz.id, input);
  revalidatePath(`/variations`);
  redirect(`/variations/jobs/${newId}?new=1`);
}

export async function archiveJobAction(form: FormData) {
  const biz = await requirePaid();
  const id = String(form.get("id") ?? "");
  const archive = form.get("archive") === "1";
  if (await getJob(biz.id, id)) await setJobArchived(biz.id, id, archive);
  revalidatePath(`/variations`);
  redirect(archive ? "/variations" : `/variations/jobs/${id}`);
}
