import "server-only";
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config, live } from "@/core/config";
import { one, query } from "@/core/db";
import type { Target } from "./identity";

/**
 * Send/verify a 6-digit code.
 * Live: Supabase Auth (SMS via Twilio configured in the Supabase dashboard; email via
 * Supabase SMTP → Resend). Set the email template to include {{ .Token }} so email
 * users get a code as well as a link — switching apps on site loses people.
 * Mock: code stored in otp_codes and returned so the UI can show it.
 */

function supa() {
  return createClient(config.supabaseUrl!, config.supabaseAnonKey!, { auth: { persistSession: false } });
}

export async function sendCode(t: Target): Promise<{ ok: true; mockCode?: string } | { ok: false; error: string }> {
  if (live.auth) {
    const { error } =
      t.kind === "phone"
        ? await supa().auth.signInWithOtp({ phone: t.value })
        : await supa().auth.signInWithOtp({ email: t.value, options: { emailRedirectTo: `${config.appUrl}/login/callback` } });
    if (error) return { ok: false, error: friendly(error.message) };
    return { ok: true };
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await query(
    `insert into otp_codes(target, code, attempts, expires_at) values ($1,$2,0, now() + interval '10 minutes')
     on conflict (target) do update set code = excluded.code, attempts = 0, expires_at = excluded.expires_at`,
    [t.value, code],
  );
  return { ok: true, mockCode: code };
}

/** Returns our internal user id on success. */
export async function verifyCode(t: Target, code: string): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return { ok: false, error: "The code is 6 numbers." };

  if (live.auth) {
    const { data, error } =
      t.kind === "phone"
        ? await supa().auth.verifyOtp({ phone: t.value, token: clean, type: "sms" })
        : await supa().auth.verifyOtp({ email: t.value, token: clean, type: "email" });
    if (error || !data.user) return { ok: false, error: "That code didn't work. Check it or send a new one." };
    return { ok: true, userId: await upsertUser(t, data.user.id) };
  }

  const row = await one<{ code: string; attempts: number; expired: boolean }>(
    `select code, attempts, expires_at < now() as expired from otp_codes where target = $1`,
    [t.value],
  );
  if (!row || row.expired) return { ok: false, error: "That code has expired. Send a new one." };
  if (row.attempts >= 5) return { ok: false, error: "Too many tries. Send a new code." };
  if (row.code !== clean) {
    await query(`update otp_codes set attempts = attempts + 1 where target = $1`, [t.value]);
    return { ok: false, error: "That code didn't work. Check it or send a new one." };
  }
  await query(`delete from otp_codes where target = $1`, [t.value]);
  return { ok: true, userId: await upsertUser(t) };
}

async function upsertUser(t: Target, id?: string): Promise<string> {
  const col = t.kind === "phone" ? "phone" : "email";
  const existing = await one<{ id: string }>(`select id from users where ${col} = $1`, [t.value]);
  if (existing) return existing.id;
  const row = await one<{ id: string }>(
    id
      ? `insert into users(id, ${col}) values ($2, $1) returning id`
      : `insert into users(${col}) values ($1) returning id`,
    id ? [t.value, id] : [t.value],
  );
  return row!.id;
}

function friendly(msg: string) {
  if (/rate limit|too many/i.test(msg)) return "Too many codes sent. Give it a minute and try again.";
  return "Couldn't send the code. Check the number and try again.";
}
