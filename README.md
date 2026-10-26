# Chaim Gesteter Accounting

A complete Next.js App Router application with TypeScript, React, Lucide icons, Recharts, PostgreSQL, and Drizzle ORM. The visual system uses bundled DM Sans, DM Serif Display, and Manrope fonts, locally served editorial workspace images, warm ivory, deep evergreen, and terracotta/gold accents. The design uses oversized display typography, large editorial crops, open numbered service listings, a calculator directory, and magazine-style article layouts. No floating contact widget or announcement bar is included. No remote fonts, analytics, or stock-photo requests are needed.

## Quick start

Use Node.js 24 LTS and npm. Work in this checkout; cloud tasks are already isolated, so a Git worktree is unnecessary.

```sh
npm ci
npm run dev:db
```

Keep the database process running. In another terminal:

```sh
npm run db:push
npm run admin:setup
npm run dev
```

`dev:db` installs no system packages. It runs the npm-distributed PostgreSQL binary as the current non-root user, listens only on loopback port 55433, retains data under ignored `.local-data`, and writes a random local connection password and session secret to ignored `.env.local`. Restart with the same command to reuse data. Do not use this development database in production. Do not publish a snapshot with real client data or production secrets.

`admin:setup` prompts for an email and a hidden password of at least 14 characters. It stores only a scrypt salt/hash and rotates the session signing secret in `.env.local`. Never commit this file. Restart the application after configuration changes. The admin route is `/admin`.

If using your own PostgreSQL instance, create `.env.local` using `.env.example`, set `DATABASE_URL`, and skip `dev:db`. Run `npm run db:push` against a **new database**. This command is idempotent initial schema preparation, not a destructive migration system. Future schema changes need reviewed migrations and backups. Database access uses a typed Drizzle repository layer with parameterized operations. No Prisma engine download is required.

## What is implemented

- Responsive homepage, sticky navigation with a click-to-call phone number, mobile menu and a rules-based service finder.
- About, seven individual service pages and service overview, pricing, ten expandable FAQs, booking, privacy, and terms.
- Six calculator routes: operating profit, hourly rate, and savings are live, with real formulas, charts, reset controls, and assumptions. Federal ordinary income and self-employment tax estimators support 2025 and 2026. The quarterly tool budgets 100% of estimated current-year federal tax after withholding, across four payment periods; it does not calculate prior-year safe harbors or underpayment penalties.
- Resource center with category filtering, search, clean URLs, article pages, reading times, related links, and sharing. Ten 600–1,000-word evergreen financial-organization and planning articles are published by default from `lib/published-articles.json`, with an editorial review date, not a claim of accountant certification. They contain no year-specific tax advice. Existing owner content is preserved; the versioned content merge adds the new public articles to older settings and respects saved edits/unpublication. After contentVersion 2 is saved, deliberate article deletions remain deleted. Twelve additional 600–1,000-word starter drafts live in `lib/articles.json`. Import them from Admin → Articles. They are unpublished because no professional factual review has occurred. Public routes return 404 for drafts. Publication requires an authenticated editor to record a review date and explicitly publish.
- PostgreSQL-backed admin business settings, service confirmation/hiding/descriptions/images/additions, article editing, image uploads, pricing, booking settings, FAQs, inquiry management, genuine permission-based testimonials, and retention controls.
- Server-side validation, origin checks for mutations, signed expiring HTTP-only admin sessions, scrypt password verification, database-backed atomic rate limits, bot honeypot, upload size/type/magic-byte checks, escaped plain-text content, and security headers.
- Dynamic sitemap, robots rules, page metadata, and structured business data. No location, CPA credentials, prices, testimonials, awards, or client counts are invented.

## Production configuration and launch gates

The application is built and locally tested, but **not production-ready until these steps are completed**:

1. Provision durable managed PostgreSQL with verified TLS and backups. Set `DATABASE_URL` securely, prepare the schema, and use a least-privilege application database account. Do not disable certificate verification. Run schema setup from a secure machine with the production connection binding; if no `.env.local` is present use `node --import tsx scripts/db-push.ts` with injected variables.
2. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and a random `SESSION_SECRET` of at least 32 characters using secure deployment settings. Generate credentials with `admin:setup` locally and transfer the bindings securely. No default admin password exists. Use HTTPS. Sessions expire after four hours; rotate the secret to invalidate all sessions. Consider managed SSO/MFA and individual audit logs before expanding beyond this single administrator.
3. Set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS canonical origin **before building**. It must match browser request origins for mutation checks. Add real business contact information, biography, service area, and confirmed offerings in Admin. No address or office location is assumed. Confirm whether consultations are free; default label omits “Free.”
4. In Admin → Appointments, supply an actual HTTPS Calendly or Cal.com event URL. Configure real calendar availability, durations, meeting formats, timezone handling, conflict prevention, reminder/confirmation emails, cancellation/rescheduling, and admin notifications **in that provider**. Dashboard labels do not configure the provider’s event rules. Test an actual booking through cancellation/rescheduling. The site links to provider-hosted scheduling and never invents slots or marks a booking complete. Appointment records are viewed in the provider, not synchronized into this app.
5. Optional inquiry email: configure a Resend API key, verified `NOTIFICATION_FROM`, and `NOTIFICATION_TO`. Only an inquiry ID is emailed, with no contact message or personal details. Inquiry storage is the source of truth; the website acknowledges a saved inquiry even if optional email fails. Delivery/retry monitoring should be added for operational requirements. No email delivery was verified without a real provider account.
6. Review the educational tax tools against your practice’s requirements before using them for individual advice. The numerical data and SE formulas were cross-checked against Policy Simulation Library’s Tax-Calculator revision `65df50a53edc24ceaab65a03bfacea01e428249f` on October 26, 2026. Extracted 2025/2026 data and a SHA-256/source record live under `lib/data`; formula boundary tests cover all four filing statuses. Direct IRS and SSA requests were blocked in the cloud; no live primary-source review or accountant sign-off is claimed. The ordinary-income model excludes credits, preferential capital gains, QBI, AMT, SE/payroll tax, NIIT, special deductions, and state/local taxes. The SE tool covers one self-employed person, the $400 net-earnings minimum, own-wage Social Security cap, regular Medicare, and incremental Additional Medicare on SE income. The quarterly tool is a full-year budget rather than a safe-harbor determination. Source notes and assumptions are visible on the calculator pages. Do not market these tools as full tax-return or penalty calculations.
7. Professionally review the twelve starter articles against reliable current sources. They are general educational drafts, not reviewed advice. Edit, record the genuine review date, and publish only approved articles. Add source links as needed. No publication/review dates or professional review are fabricated.
8. Review legal text for actual jurisdiction and practices. Establish retention and access procedures; run Admin → Retention regularly. The default 90-day retention is **not an automatic scheduled deletion**. Inquiry deletion is permanent. Uploaded images need separate cleanup of unused `image-*` Content records. Database backups have their own retention. Never collect tax documents, SSNs, or bank details through the contact form.
9. Test production email/booking, HTTPS sessions, mobile devices, accessibility, failure states, backups/restores, and provider policies. Add monitoring. Rate limits are conservative global quotas (30 contact messages/hour, 15 login attempts/15 minutes), shared across server instances via PostgreSQL; deploy edge-level per-client bot protection for public traffic.

Newsletter signup is hidden until an actual consent-based provider URL is configured. Testimonials are hidden until entries with permission are added. Services are labeled proposed until confirmed by the owner. Privacy text describes the implemented behavior and still requires owner/legal review.

## Tests and build

```sh
npm test
npm run typecheck
npm run build
npm start
```

Unit tests cover formulas, zero denominators, losses, compounding, unreachable savings goals, tax brackets and wage caps, credential verification, JWT integrity/expiry, origin checks, booking URL validation, reviewed publication, and all twelve draft lengths.

```sh
npx playwright install chromium
npm run test:e2e
```

Start the application first. Browser tests cover public routes, mobile overflow, calculator changes/reset, tax estimates, reset controls, and unavailable booking, keyboard FAQs, service recommendations, and protected login. The two configured admin/contact browser tests run only when `TEST_ADMIN_CREDENTIALS_FILE` names a local JSON file containing test `email`/`password`. Use a dedicated test database and test instance; they save content and inquiries. This credential file must stay outside the checkout and must not be committed.

For database/API integration checks:

```sh
TEST_ADMIN_CREDENTIALS_FILE=/secure/path/test-credentials.json npm run test:integration
```

**This integration script clears settings and rate-limit records in its final cleanup. Never target production or an existing content database.** It verifies authentication, cookie security, origin rejection, validation, bot rejection, inquiry persistence/address/delete, settings persistence, image validation/upload/read, and logout. Use a disposable database and matching running test instance.

The onboarding machine used an npm-distributed Chromium build when the normal Playwright CDN was blocked. `playwright.local.config.ts` is an ignored machine-specific launch configuration, not required for normal development.

## Deployment

Import the selected repository into Vercel as a Next.js project. Node.js 24 is pinned in package.json. Without an explicit NEXT_PUBLIC_SITE_URL, the app derives its public origin from Vercel’s trusted deployment metadata; preview form requests also accept that deployment’s VERCEL_URL. A custom canonical domain can be configured with NEXT_PUBLIC_SITE_URL. Set secure production environment bindings, provision PostgreSQL, initialize the schema, and deploy using `npm run build`. Uploaded images are stored in PostgreSQL rather than ephemeral deployment disk (2 MB maximum each); object storage is a sensible upgrade for larger media collections. Use a connection pool appropriate to the hosting platform. Set the canonical origin before building and verify admin cookies on HTTPS. Do not expose the local database publicly.

The database, secrets, provider accounts, and publication are separate from the code. No deployment, Git push, provider booking, email delivery, or fresh-task snapshot restoration is implied by a passing local build.
