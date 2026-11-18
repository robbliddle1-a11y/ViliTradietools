-- 002: jobs + variations (Variations tool). Money is integer cents, AUD.

alter table businesses add column if not exists gst_registered boolean not null default true;

create table if not exists jobs (
  id                    uuid primary key default gen_random_uuid(),
  business_id           uuid not null references businesses(id) on delete cascade,
  name                  text not null,                 -- what the tradie calls it, e.g. "Nguyen bathroom reno"
  client_name           text not null,
  client_email          text,
  client_phone          text,                          -- E.164 when it's an AU mobile
  site_address          text not null,
  contract_price_cents  bigint not null check (contract_price_cents >= 0),  -- incl. GST
  contract_date         date,
  is_domestic           boolean not null default true, -- domestic building contract → QBCC Act Sch 1B rules apply
  archived_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists jobs_business_idx on jobs(business_id, archived_at, updated_at desc);

create table if not exists variations (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  job_id           uuid not null references jobs(id) on delete cascade,
  number           int not null,                       -- V1, V2… per job
  title            text not null,
  description      text not null default '',
  reason           text not null default '',
  amount_ex_cents  bigint not null default 0,          -- signed: negative = credit to client
  gst_cents        bigint not null default 0,
  amount_inc_cents bigint not null default 0,
  days_delta       int not null default 0,             -- effect on completion date, days (can be negative)
  status           text not null default 'draft' check (status in ('draft','sent','signed','declined','withdrawn')),
  sent_at          timestamptz,
  decided_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (job_id, number)
);
create index if not exists variations_job_idx on variations(job_id, number);

alter table jobs       enable row level security;
alter table variations enable row level security;
