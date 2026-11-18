import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "@/core/config";
import { one } from "@/core/db";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";

export type User = { id: string; phone: string | null; email: string | null };

/** Current user or null. Cached per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const s = await verifySession((await cookies()).get(SESSION_COOKIE)?.value, config.sessionSecret);
  if (!s) return null;
  return one<User>(`select id, phone, email from users where id = $1`, [s.uid]);
});

export async function requireUser(): Promise<User> {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}

/** Call from a Server Action / Route Handler only. */
export async function startSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, await signSession(userId, config.sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
