import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config, live } from "@/core/config";

/**
 * File storage. Keys look like `<businessId>/logo/<uuid>.png`.
 * Live: Supabase Storage, private bucket "level" (create it in the dashboard).
 * Mock: .data/uploads on disk.
 * Files are always served through /api/files/<key>, which checks the caller owns
 * the business in the first path segment (or holds a valid share token — Stage 4).
 */
const BUCKET = "level";
const LOCAL = path.join(process.cwd(), ".data", "uploads");

function admin() {
  return createClient(config.supabaseUrl!, config.supabaseServiceKey!, { auth: { persistSession: false } });
}

function safeKey(key: string) {
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(key) || key.includes("..")) throw new Error("bad storage key");
  return key;
}

export async function putFile(key: string, data: Uint8Array, contentType: string) {
  safeKey(key);
  if (live.storage) {
    const { error } = await admin().storage.from(BUCKET).upload(key, data, { contentType, upsert: true });
    if (error) throw error;
    return;
  }
  const p = path.join(LOCAL, key);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, data);
  await writeFile(p + ".type", contentType);
}

export async function getFile(key: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  safeKey(key);
  if (live.storage) {
    const { data, error } = await admin().storage.from(BUCKET).download(key);
    if (error || !data) return null;
    return { data: new Uint8Array(await data.arrayBuffer()), contentType: data.type || "application/octet-stream" };
  }
  try {
    const p = path.join(LOCAL, key);
    return { data: await readFile(p), contentType: await readFile(p + ".type", "utf8") };
  } catch {
    return null;
  }
}

export const IMAGE_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
