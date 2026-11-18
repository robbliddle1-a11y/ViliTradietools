import "server-only";
import { one, query } from "@/core/db";

/** Data access for the Variations tool. Every function takes businessId and scopes by it. */

export type Job = {
  id: string;
  business_id: string;
  name: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  site_address: string;
  contract_price_cents: number;
  contract_date: string | null; // yyyy-mm-dd
  is_domestic: boolean;
  archived_at: Date | null;
  updated_at: Date;
};

export type VariationStatus = "draft" | "sent" | "signed" | "declined" | "withdrawn";

export type Variation = {
  id: string;
  job_id: string;
  number: number;
  title: string;
  description: string;
  reason: string;
  amount_ex_cents: number;
  gst_cents: number;
  amount_inc_cents: number;
  days_delta: number;
  status: VariationStatus;
  sent_at: Date | null;
  decided_at: Date | null;
  created_at: Date;
};

const jobCols = (t = "") => {
  const p = t ? `${t}.` : "";
  return `${p}id, ${p}business_id, ${p}name, ${p}client_name, ${p}client_email, ${p}client_phone, ${p}site_address,
  ${p}contract_price_cents::float8 as contract_price_cents, to_char(${p}contract_date,'YYYY-MM-DD') as contract_date,
  ${p}is_domestic, ${p}archived_at, ${p}updated_at`;
};
const JOB_COLS = jobCols();

const VAR_COLS = `id, job_id, number, title, description, reason,
  amount_ex_cents::float8 as amount_ex_cents, gst_cents::float8 as gst_cents, amount_inc_cents::float8 as amount_inc_cents,
  days_delta, status, sent_at, decided_at, created_at`;

export type JobSummary = Job & {
  approved_cents: number;
  pending_cents: number;
  pending_count: number;
  variation_count: number;
};

export async function listJobs(businessId: string, opts: { archived?: boolean; q?: string } = {}) {
  return query<JobSummary>(
    `select ${jobCols("j")},
       coalesce(sum(v.amount_inc_cents) filter (where v.status = 'signed'), 0)::float8 as approved_cents,
       coalesce(sum(v.amount_inc_cents) filter (where v.status = 'sent'), 0)::float8 as pending_cents,
       count(v.id) filter (where v.status = 'sent')::int as pending_count,
       count(v.id) filter (where v.status <> 'withdrawn')::int as variation_count
     from jobs j left join variations v on v.job_id = j.id
     where j.business_id = $1
       and (j.archived_at is null) = $2
       and ($3::text is null or j.name ilike $3 or j.client_name ilike $3 or j.site_address ilike $3)
     group by j.id
     order by j.updated_at desc
     limit 200`,
    [businessId, !opts.archived, opts.q ? `%${opts.q}%` : null],
  );
}

export async function getJob(businessId: string, jobId: string) {
  if (!isUuid(jobId)) return null;
  return one<Job>(`select ${JOB_COLS} from jobs where id = $1 and business_id = $2`, [jobId, businessId]);
}

export type JobInput = Pick<
  Job,
  "name" | "client_name" | "client_email" | "client_phone" | "site_address" | "contract_price_cents" | "contract_date" | "is_domestic"
>;

export async function createJob(businessId: string, v: JobInput) {
  return (await one<{ id: string }>(
    `insert into jobs (business_id, name, client_name, client_email, client_phone, site_address, contract_price_cents, contract_date, is_domestic)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
    [businessId, v.name, v.client_name, v.client_email, v.client_phone, v.site_address, v.contract_price_cents, v.contract_date, v.is_domestic],
  ))!.id;
}

export async function updateJob(businessId: string, jobId: string, v: JobInput) {
  await query(
    `update jobs set name=$3, client_name=$4, client_email=$5, client_phone=$6, site_address=$7,
       contract_price_cents=$8, contract_date=$9, is_domestic=$10, updated_at=now()
     where id=$1 and business_id=$2`,
    [jobId, businessId, v.name, v.client_name, v.client_email, v.client_phone, v.site_address, v.contract_price_cents, v.contract_date, v.is_domestic],
  );
}

export async function setJobArchived(businessId: string, jobId: string, archived: boolean) {
  await query(`update jobs set archived_at = ${archived ? "now()" : "null"}, updated_at = now() where id=$1 and business_id=$2`, [
    jobId,
    businessId,
  ]);
}

export async function listVariations(businessId: string, jobId: string) {
  return query<Variation>(
    `select ${VAR_COLS} from variations where job_id = $1 and business_id = $2 order by number desc`,
    [jobId, businessId],
  );
}

export function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
