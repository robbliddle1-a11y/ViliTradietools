# Level — ViLi tradie suite

Mobile-first web tools for Australian tradies, starting in Queensland. One login, one subscription.

| Tool | Type | Status |
|---|---|---|
| Variations | Paid | In build |
| Compliance Wallet | Paid | Planned |
| SWMS Builder | Paid | Planned |
| Payment Claims (BIF Act) | Paid | Planned |
| Rate Calculator, Material Calculators, Margin Checker | Free | Planned |

## Stack
Next.js (App Router) · Supabase (Postgres, auth, storage, RLS) · Stripe · Twilio (SMS) · Resend (email) · Vercel.

## Layout

```
src/
  core/            shared modules every tool reuses
    brand.ts       suite name + tool registry (nav is built from this)
    ui/            design tokens + component kit
    auth/          SMS OTP + email magic link            (Stage 1)
    profile/       business profile: ABN, QBCC no, logo  (Stage 1)
    billing/       Stripe subscription + paywall         (Stage 1)
    shell/         app shell / suite navigation          (Stage 1)
  tools/
    variations/    first paid tool                       (Stages 2–5)
  app/             routes only — thin wrappers over core/ and tools/
```

Rule: tools import from `core/`, never from each other.

## Run locally
```
npm install
npm run dev     # http://localhost:3000/styleguide
```

## Legal framing
Every legal or regulatory output is a template/workflow tool, not legal or WHS advice.
Legislative sections relied on are cited in code comments (`// LEGAL:`) and listed in `docs/legislation.md`.
