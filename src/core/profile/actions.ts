"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/server";
import { normaliseAuMobile, normaliseEmail } from "@/core/auth/identity";
import { IMAGE_TYPES, putFile } from "@/core/storage";
import { getBusinessForUser, saveBusiness } from "./repo";
import { isPlausibleQbcc, isValidAbn } from "./validate";

export type ProfileState = { errors?: Record<string, string>; saved?: boolean };

const MAX_LOGO = 2 * 1024 * 1024;

export async function saveProfileAction(_: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireUser();
  const existing = await getBusinessForUser(user.id);
  const s = (k: string) => String(form.get(k) ?? "").trim();
  const errors: Record<string, string> = {};

  const name = s("name");
  if (!name) errors.name = "Your business name goes on every document.";

  const abn = s("abn").replace(/\s/g, "");
  if (abn && !isValidAbn(abn)) errors.abn = "That ABN doesn't check out. Have another look.";

  const qbcc = s("qbcc_licence").replace(/\s/g, "");
  if (qbcc && !isPlausibleQbcc(qbcc)) errors.qbcc_licence = "QBCC licence numbers are just digits.";

  const phoneRaw = s("phone");
  const phone = phoneRaw ? normaliseAuMobile(phoneRaw) ?? phoneRaw.replace(/[^\d+ ]/g, "") : null;

  const emailRaw = s("email");
  const email = emailRaw ? normaliseEmail(emailRaw) : null;
  if (emailRaw && !email) errors.email = "That email doesn't look right.";

  let logo_key: string | undefined;
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const ext = IMAGE_TYPES[logo.type];
    if (!ext) errors.logo = "Logo needs to be a PNG, JPG or WebP.";
    else if (logo.size > MAX_LOGO) errors.logo = "Logo's too big. Keep it under 2MB.";
    else if (!Object.keys(errors).length) {
      // Key is namespaced by owner until the business row exists; served via ownership check.
      logo_key = `${existing?.id ?? `u-${user.id}`}/logo/${randomUUID()}.${ext}`;
      await putFile(logo_key, new Uint8Array(await logo.arrayBuffer()), logo.type);
    }
  }

  if (Object.keys(errors).length) return { errors };

  await saveBusiness(user.id, {
    name,
    abn: abn || null,
    qbcc_licence: qbcc || null,
    contact_name: s("contact_name") || null,
    phone,
    email,
    address: s("address") || null,
    gst_registered: s("gst_registered") !== "no",
    logo_key,
  });

  revalidatePath("/", "layout");
  if (!existing) redirect("/home?welcome=1");
  return { saved: true };
}
