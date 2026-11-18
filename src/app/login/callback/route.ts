import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { config, live } from "@/core/config";
import { one, query } from "@/core/db";
import { startSession } from "@/core/auth/server";

/**
 * Email magic-link landing (live mode). Supabase email template link should be:
 *   {{ .SiteURL }}/login/callback?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  if (!live.auth || !tokenHash) return NextResponse.redirect(new URL("/login", url));

  const supa = createClient(config.supabaseUrl!, config.supabaseAnonKey!, { auth: { persistSession: false } });
  const { data, error } = await supa.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  const email = data.user?.email?.toLowerCase();
  if (error || !data.user || !email) return NextResponse.redirect(new URL("/login?expired=1", url));

  let user = await one<{ id: string }>(`select id from users where email = $1`, [email]);
  if (!user) user = (await query<{ id: string }>(`insert into users(id, email) values ($1,$2) returning id`, [data.user.id, email]))[0];
  await startSession(user.id);
  return NextResponse.redirect(new URL("/home", url));
}
