import "server-only";
import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "@/core/config";

/**
 * One tiny query interface over two engines:
 *  - live: postgres.js against Supabase (DATABASE_URL, use the pooler URL on Vercel)
 *  - mock: PGlite (real Postgres in WASM) persisted to .data/pglite
 * Same SQL, same migrations, so mock behaviour matches production.
 */
type Row = Record<string, unknown>;
type Engine = { query: (text: string, params?: unknown[]) => Promise<Row[]> };

const g = globalThis as unknown as { __levelDb?: Promise<Engine> };

async function migrate(engine: Engine) {
  await engine.query(`create table if not exists _migrations (name text primary key, run_at timestamptz default now())`);
  const dir = path.join(process.cwd(), "db", "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const done = new Set((await engine.query(`select name from _migrations`)).map((r) => r.name as string));
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = await readFile(path.join(dir, f), "utf8");
    await engine.query(sql);
    await engine.query(`insert into _migrations(name) values ($1)`, [f]);
  }
}

async function connect(): Promise<Engine> {
  let engine: Engine;
  if (config.databaseUrl) {
    const { default: postgres } = await import("postgres");
    // prepare:false is required for Supabase's transaction pooler.
    const sql = postgres(config.databaseUrl, { prepare: false, max: 5 });
    engine = {
      query: async (text, params = []) => {
        // Multi-statement migration files have no params → use simple protocol.
        const res = params.length ? await sql.unsafe(text, params as never[]) : await sql.unsafe(text);
        return res as unknown as Row[];
      },
    };
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const dataDir = path.join(process.cwd(), ".data", "pglite");
    await mkdir(dataDir, { recursive: true });
    const db = new PGlite(dataDir);
    engine = {
      query: async (text, params = []) => {
        if (!params.length && text.includes(";")) {
          const out = await db.exec(text);
          return (out.at(-1)?.rows ?? []) as Row[];
        }
        return (await db.query(text, params)).rows as Row[];
      },
    };
  }
  await migrate(engine);
  return engine;
}

function engine() {
  g.__levelDb ??= connect();
  return g.__levelDb;
}

/** Run a parameterised query. Always use $1, $2… — never interpolate user input. */
export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await (await engine()).query(text, params)) as T[];
}

export async function one<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(text, params))[0] ?? null;
}
