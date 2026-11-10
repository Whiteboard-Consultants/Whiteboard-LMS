# Whiteboard CRM

The office CRM lives in this Next.js app, next to the existing LMS. Admins and managers open it from the **CRM** link in the admin sidebar. Counsellors who are not LMS users sign in at `/crm`.

## Setup

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Open [http://localhost:3000/crm](http://localhost:3000/crm). Copy `.env.example` to `.env` first if `DATABASE_URL` and `AUTH_SECRET` are not set. `npm run seed` is safe to re-run locally: it resets the four seed users, the lookup lists, and leads `WC-0001` to `WC-0006`. It does not delete other leads. It refuses to run when `NODE_ENV=production` unless `SEED_CONFIRM=yes`.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase pooled Postgres URL (port 6543). The CRM tables are in the `crm` schema. |
| `DIRECT_URL` | Supabase session URL (port 5432), used when Prisma updates the database structure. |
| `AUTH_SECRET` | Auth.js session secret. Required for a real deployment. |
| `CRON_SECRET` | Bearer token for `GET /api/cron/digest`. |
| `CRON_ENABLED` | `true` starts node-cron inside the server. Default off. |
| `CRON_SCHEDULE` | Cron expression. Default `0 8 * * *`, timezone Asia/Kolkata. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Digest email. If `SMTP_HOST` is empty, the digest is printed to the console. |
| `NEXT_PUBLIC_SITE_URL` | Used for links inside the digest. |

## Seed logins

Password for every seed user: `ChangeMe123!`

| Email | Role |
| --- | --- |
| admin@example.com | ADMIN |
| counsellor1@example.com | COUNSELLOR |
| counsellor2@example.com | COUNSELLOR |
| counsellor3@example.com | COUNSELLOR |

An LMS admin or manager who is already signed in is bridged into the CRM by email. If that email has no CRM user yet, one is created (LMS admin becomes CRM admin, LMS manager becomes counsellor). An existing CRM role is left as it is.

## What the screens do

- **Today** — overdue and due-today leads, most overdue first. Default counsellor filter is you. Each row can log an activity.
- **Leads** — server search, filters, sort, pagination, column groups (Capture, Profile, Interest, Pipeline, Scoring, Value), CSV export. Counsellors start on “My leads”.
- **Lead** — profile, derived summary, stage history, activity timeline. Archive is admin-only and can be restored. An admin can also permanently delete a lead from the lead page or the leads list. That removes its activities and stage history.
- **Activity** — all logged contacts, with filters and a quick add.
- **Dashboard** — KPIs, breakdown tables, and charts. The 12-month trend ignores the enquiry-date filter and still respects the counsellor filter.
- **Import** — CSV or XLSX, column mapping, preview, then skip / update / import duplicates.
- **Settings** (admin) — lookups, stage probabilities, scoring, lead-code prefix, auto-assign, users, API keys.
- **Enquire** — public form at `/enquire`.

Money is shown in INR with Indian grouping (`en-IN`). Dates are shown as `dd-MMM-yyyy`. “Today” is the calendar date in Asia/Kolkata. Date values are stored as UTC midnight so they do not shift between SQLite and Postgres. Every date field opens a calendar and also accepts typed dates.

## Derived fields

`src/lib/crm/leadMetrics.ts` is the only place these are calculated. Nothing derived is stored.

For a lead, using its activities and today’s Kolkata date:

- **businessVertical** comes from the product category lookup.
- **firstContactDate** / **lastContactDate** / **contactAttempts** come from activities.
- **daysToFirstContact** is the first activity date minus the enquiry date.
- **nextFollowUpDate** is `firstContactDue` when there are no activities. Otherwise it is the latest `nextFollowUpDate` across activities, unless that date is empty or on/before the last contact (that follow-up was already actioned), in which case it is empty.
- **followUpStatus** is Closed for Enrolled (Won) and Lost; otherwise No Follow-up Set, Overdue, Due Today, or Scheduled.
- **duplicate** is true when another non-archived lead shares a non-empty mobile or email.
- **profileCompleteness** is how many of mobile, email, city, current level, passout year, source, owner, product, and budget are filled, divided by 9.
- **closureProbability** is the stage lookup probability. **weightedValue** is expected value times that probability.
- **leadScore** is empty for closed leads and when stage is empty. Otherwise it is capped at 100 from closure weight, temperature, recency, profile completeness, and budget. Points and grade thresholds are editable in Settings.
- **dataAlert** is the first problem in this order: missing mobile, no owner, no product, Study Abroad without a real country, Lost without a reason, Enrolled or Lost without a closed date, no follow-up set. Otherwise OK.

## Lead intake API

Create a key in Settings. The raw key is shown once and stored as a SHA-256 hash.

```bash
curl -X POST https://www.whiteboardconsultant.com/api/intake/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: wc_your_key" \
  -d '{"name":"Asha Roy","mobile":"9830012345","email":"asha@example.com","source":"Facebook / Meta Ads","productCategory":"Study Abroad","city":"Kolkata","currentLevel":"Class 12","passoutYear":2027}'
```

A new lead is stage New Lead, enquiry date today, and first-contact due today plus the default lead time (1 day unless changed). The response is `{ "leadCode": "WC-0007", "duplicate": false }`.

If that mobile or email already belongs to a non-archived lead, no new lead is created. An activity “Duplicate enquiry received via {source}” is added to the newest match and the API returns **409** with the existing `leadCode`.

Turn on **Auto-assign** in Settings to hand new intake leads to active counsellors in rotation.

### Meta Lead Ads

In Meta Business Suite, open the form’s CRM / Leads access and add a webhook, or use Zapier/Make as below. Map full name, phone, and email onto the JSON fields. Set `source` to `Facebook / Meta Ads`. Send the `x-api-key` header. Meta will retry non-2xx responses, so a 409 is safe: it records the duplicate and does not create a second lead.

### Google Forms / Sheets

Add an Apps Script `onFormSubmit` trigger, or a Zapier Google Sheets “new row” zap, that POSTs the same JSON. Use `source` `Website Form` or `Google Ads` depending on the campaign. Parse the passout year as a number.

### WhatsApp

Point the WhatsApp business webhook, or a tool such as Wati / Interakt / Make, at the intake URL. Set `source` to `WhatsApp`. Send the sender’s phone as `mobile`.

### Zapier or Make

Use a Webhook or HTTP action: POST, header `x-api-key`, JSON body. Map whatever the trigger gives you (a Meta lead, a sheet row, a WhatsApp message) onto `name`, `mobile`, `email`, `source`, `campaign`, and `productCategory`.

The public form at `/enquire` uses the same create/duplicate logic, with a honeypot field and a limit of 5 submissions per IP each 10 minutes. The site sends `X-Frame-Options: DENY`, so link to `/enquire` instead of embedding it in an iframe unless that header is removed for this path.

## Daily digest

`GET` or `POST /api/cron/digest` with `Authorization: Bearer $CRON_SECRET` emails each active user their overdue and due-today leads. On Vercel, add a cron in `vercel.json` that hits this route. On a VPS, set `CRON_ENABLED=true` or call the route from system cron. Without SMTP, the message is logged.

## Deploy

### Vercel

The CRM already uses the Supabase Postgres database, in a schema named `crm`. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `CRON_SECRET`, and the SMTP variables on Vercel. Do not run the seed against that database unless you intend to reset the sample users and lookups.

### Small VPS

Install Node 20+, clone the repo, set the env vars, `npm install`, `npx prisma migrate deploy`, `npm run build`, and run `npm start` behind a process manager. Put nginx in front and schedule the digest with cron.

## Checks

```bash
npm run typecheck
npm test
npm run lint
```

## Assumptions

- CRM login is Auth.js at `/api/crm-auth`, separate from the LMS Supabase login, so the two auth systems do not share a route.
- Import is available to every CRM user. Settings, user management, API keys, archive/restore, and permanent delete are admin-only.
- Auto-assign is off until an admin enables it. The default first-contact gap is 1 day.
- Renaming a lookup updates current lead and activity values. Stage history keeps the old label.
- Unknown lookup text in an import is saved as typed.
- A blank cell does not wipe a field when you choose “Update existing”.
- The public form requires a consent checkbox. The intake API does not, so ad-platform calls are not blocked.
- Lists use indexed SQL for stored filters and paginate on the server. Filters that depend on derived fields (status, grade, duplicate, data alert) are applied after those rows are scored. That stays practical at 20,000 leads on one office server.
- The CRM database is the `crm` schema in the existing Supabase project. It is separate from the LMS tables in `public`.
