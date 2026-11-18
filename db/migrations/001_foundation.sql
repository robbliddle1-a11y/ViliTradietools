-- 001_foundation: users, businesses, subscriptions, OTP codes (mock mode only).
-- Shared by every tool in the suite.
-- The app talks to Postgres server-side and scopes every query by business_id
-- (see src/core/*/repo.ts). RLS is also enabled as defence in depth so the
-- Supabase anon/authenticated roles can never read these tables directly.

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  phone       text unique,          -- E.164, e.g. +61412345678
  email       text unique,          -- lowercased
  created_at  timestamptz not null default now()
);

create table if not exists businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references users(id) on delete cascade,
  name          text not null,      -- legal / trading name shown on documents
  abn           text,               -- 11 digits, no spaces
  qbcc_licence  text,               -- digits only
  contact_name  text,
  phone         text,
  email         text,
  address       text,
  logo_key      text,               -- storage key
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists businesses_owner_idx on businesses(owner_id);

create table if not exists subscriptions (
  business_id             uuid primary key references businesses(id) on delete cascade,
  status                  text not null default 'none', -- none | active | trialing | past_due | canceled
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  current_period_end      timestamptz,
  updated_at              timestamptz not null default now()
);

-- Only used when Supabase Auth isn't configured (mock mode).
create table if not exists otp_codes (
  target      text primary key,     -- phone or email
  code        text not null,
  attempts    int not null default 0,
  expires_at  timestamptz not null
);

alter table users         enable row level security;
alter table businesses    enable row level security;
alter table subscriptions enable row level security;
alter table otp_codes     enable row level security;
-- No policies on purpose: only the server (table owner / service role) can access.
