import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { one } from "@/core/db";
import { requireUser } from "@/core/auth/server";

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  abn: string | null;
  qbcc_licence: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_key: string | null;
  gst_registered: boolean;
};

const COLS = `id, owner_id, name, abn, qbcc_licence, contact_name, phone, email, address, logo_key, gst_registered`;

export const getBusinessForUser = cache(async (userId: string) =>
  one<Business>(`select ${COLS} from businesses where owner_id = $1`, [userId]),
);

/** The signed-in user's business, or bounce to onboarding. Every tool page calls this. */
export async function requireBusiness(): Promise<Business> {
  const user = await requireUser();
  const b = await getBusinessForUser(user.id);
  if (!b) redirect("/onboarding");
  return b;
}

export type BusinessInput = Omit<Business, "id" | "owner_id" | "logo_key"> & { logo_key?: string | null };

export async function saveBusiness(ownerId: string, v: BusinessInput): Promise<Business> {
  const row = await one<Business>(
    `insert into businesses (owner_id, name, abn, qbcc_licence, contact_name, phone, email, address, logo_key, gst_registered)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     on conflict (owner_id) do update set
       name = excluded.name, abn = excluded.abn, qbcc_licence = excluded.qbcc_licence,
       contact_name = excluded.contact_name, phone = excluded.phone, email = excluded.email,
       address = excluded.address, gst_registered = excluded.gst_registered, logo_key = coalesce(excluded.logo_key, businesses.logo_key),
       updated_at = now()
     returning ${COLS}`,
    [ownerId, v.name, v.abn, v.qbcc_licence, v.contact_name, v.phone, v.email, v.address, v.logo_key ?? null, v.gst_registered],
  );
  return row!;
}
