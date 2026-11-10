# CRM build plan

The CRM is a module inside this Next.js app, not a separate project. LMS admin and manager accounts reach it from the existing sidebar. Counsellors sign in with CRM credentials.

Assumption when the brief conflicts with the current LMS: keep Supabase auth for the LMS, and add Auth.js for the CRM at `/api/crm-auth` so the two logins do not share a route.

## Phase 1 — Data and derived metrics

- Prisma schema (SQLite now, Postgres-compatible types) and the initial migration
- Lookup lists, settings, users, the six sample leads, and their activities in `npm run seed`
- `src/lib/crm/leadMetrics.ts` and dashboard aggregation as pure functions
- Vitest acceptance tests for the six leads and the unfiltered dashboard

Check: `npm run typecheck`, `npm test`, dev server compiles the new modules.

## Phase 2 — Auth and API

- Auth.js credentials login (bcrypt), LMS admin/manager bridge, role checks on every CRM route
- Lead list (server-side search, filters, sort, pagination), create, update, archive
- Activities, stage history, dashboard, settings, users, API keys
- Intake `POST /api/intake/leads` and public `POST /api/enquire`
- CSV/XLSX import preview and commit
- Daily digest route plus an optional node-cron schedule

Check: typecheck, tests (including the duplicate intake test against the seed), dev server.

## Phase 3 — Screens

- CRM shell (Today, Leads, Activity, Dashboard, Import, Settings) and a CRM link in the LMS admin sidebar
- Login, Today (phone layout and log-activity drawer), Leads grid, lead detail, Activity, Dashboard charts
- Import wizard, Settings, public enquiry form
- shadcn calendar popover on every date field
- Montserrat / Lato, brand colours, empty / loading / error states

Check: typecheck, tests, dev server, then click through the main screens.

## Phase 4 — Docs and finish

- README: setup, env, seed logins, derived fields, ad-platform wiring, deploy
- `.env.example`, lint, typecheck, full test run

## Decisions already made

- Dates are calendar days stored at UTC midnight. "Today" is the Asia/Kolkata date. Display is `dd-MMM-yyyy`. Money is `en-IN` INR.
- Derived fields are never stored. Duplicate detection uses non-archived leads and ignores blank mobile/email.
- Leads are archived, never hard-deleted. Admins can restore an archive.
- Settings, user management, API keys, and archive/restore are admin-only. Counsellors can view, edit, log activity, and import.
- Re-running seed resets the four seed users, lookup lists, and scoring settings, and replaces leads `WC-0001`–`WC-0006`. Other leads stay.
- Auto-assign is off until an admin turns it on. Default first-contact lead time is 1 day.
- Import of an unknown lookup label is allowed (stored as typed). Rename of a lookup updates current lead and activity values, not stage history.
- The public form requires a consent checkbox. The intake API does not, so ad-platform zaps are not blocked.
- `/enquire` is a normal page. The site sends `X-Frame-Options: DENY`, so the form is linked rather than placed in an iframe unless that header is relaxed for `/enquire`.
