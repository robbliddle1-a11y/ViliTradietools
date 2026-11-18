/**
 * Stateless signed session cookie (HMAC-SHA256 via Web Crypto, so it also runs in proxy.ts).
 * Identity comes from Supabase Auth (live) or mock OTP; once the code is verified we
 * issue our own cookie so the rest of the app doesn't care which provider ran.
 */
export const SESSION_COOKIE = "lvl_s";
export const SESSION_DAYS = 30; // tradies shouldn't have to log in on site every week

export type Session = { uid: string; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(uid: string, secret: string): Promise<string> {
  const payload: Session = { uid, exp: Date.now() + SESSION_DAYS * 86_400_000 };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined, secret: string): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}
