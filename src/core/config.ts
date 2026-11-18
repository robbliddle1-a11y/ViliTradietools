/**
 * Runtime config. Every external provider has a mock so the whole suite runs
 * with zero accounts/keys. A provider switches to "live" as soon as its env vars exist.
 * See .env.example for the full list.
 */
const env = process.env;

export const config = {
  appUrl: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  /** Postgres. Unset → in-process PGlite at .data/pglite (dev/demo only). */
  databaseUrl: env.DATABASE_URL,

  /** Supabase Auth sends + verifies the SMS / email codes. Unset → mock codes shown on screen. */
  supabaseUrl: env.SUPABASE_URL,
  supabaseAnonKey: env.SUPABASE_ANON_KEY,
  supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,

  /** Signs the session cookie. Must be set (32+ random chars) in production. */
  sessionSecret: env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me-please",

  stripeSecretKey: env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  stripePriceId: env.STRIPE_PRICE_ID,
  /** Display only. TODO(config): set the real price. */
  priceLabel: env.NEXT_PUBLIC_PRICE_LABEL ?? "Price TBC",
};

export const live = {
  db: !!config.databaseUrl,
  auth: !!(config.supabaseUrl && config.supabaseAnonKey),
  storage: !!(config.supabaseUrl && config.supabaseServiceKey),
  stripe: !!(config.stripeSecretKey && config.stripePriceId),
};

if (process.env.NODE_ENV === "production" && !env.SESSION_SECRET && live.auth) {
  throw new Error("SESSION_SECRET must be set in production");
}
