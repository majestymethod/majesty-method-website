# Majesty Method + TenderIQ website

A multi-page website with two brand experiences, a built-in content editor, real form workflows,
Google Sheets integration for Bootcamp registrations, and South African privacy features.

| Start here | |
|---|---|
| **Editing the site yourself** | [docs/EDITING-GUIDE.md](docs/EDITING-GUIDE.md) |
| **Putting it online (step by step: Render + Squarespace)** | [docs/DEPLOY-RENDER.md](docs/DEPLOY-RENDER.md) |
| Other hosting options | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| **What's done, what's pending, what you need to supply** | [docs/HANDOVER.md](docs/HANDOVER.md) |
| **POPIA / cookies / ECTA / CPA / PAIA checklist** | [docs/COMPLIANCE-REPORT.md](docs/COMPLIANCE-REPORT.md) |
| **Connecting Google Sheets** | [integrations/google-apps-script/README.md](integrations/google-apps-script/README.md) |

## Pages

| Route | Page |
|---|---|
| `/` | Brand entry: full-width hero, logo, choice between Majesty Method and TenderIQ |
| `/majesty-method` | Majesty Method homepage (emerald + gold) |
| `/majesty-method/bootcamp` | Founder Bootcamp + registration form → database + Google Sheet |
| `/majesty-method/webinars` | Free Friday webinars, per-session registration or external links, recordings |
| `/majesty-method/acceleration` | Business Acceleration Programme + discovery-call enquiry |
| `/majesty-method/courses` | Course catalogue (editable; empty state until courses are published) |
| `/majesty-method/resources` | Free resource library, optional registration-gated downloads |
| `/tenderiq` | TenderIQ product page (royal purple + gold) + registration of interest |
| `/contact` | Central contact form with enquiry routing (`?brand=tenderiq` switches to TenderIQ styling) |
| `/legal/privacy` `/legal/cookies` `/legal/terms` `/legal/paia` | Editable legal drafts |
| `/unsubscribe` | Signed one-click marketing unsubscribe |
| `/admin` | Content editor (sign-in required) |

## Technology

- **Next.js 15 (App Router) + TypeScript**, server-rendered pages, minimal client JavaScript.
- **SQLite** (better-sqlite3) for content, submissions, consent records and users — one file, easy to back up.
- **Built-in CMS** at `/admin`: no third-party CMS subscription. Draft → preview → publish.
- Images are resized to responsive WebP on upload (sharp). Fonts are self-hosted (Bodoni Moda, Hanken Grotesk; SIL Open Font Licence).
- Email via any SMTP provider (optional). Google Sheets via a small Apps Script web app.

### Why a built-in editor rather than a hosted CMS

A hosted CMS (Sanity, Contentful, etc.) would add a monthly subscription for larger teams, a second login, a second
place where personal data could end up, and more cross-border processing to explain in the privacy notice. The site
needs structured editing for about a dozen pages and three listings, which the built-in editor covers. The trade-off:
the site needs a server with a persistent disk (not a "serverless" host), and backups are your responsibility
(a backup script is included). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Local development

```bash
npm install
cp .env.example .env.local        # set APP_SECRET to a long random string
npm run admin:create -- --email you@example.com --name "Your Name"
npm run dev                        # http://localhost:3000, editor at /admin
```

The database and the seed content (logo, hero image, all default copy) are created automatically on first start.

## Project structure

```
src/app/                 Pages and API routes
  admin/                 Editor screens (protected)
  api/forms/[form]       Public form submission endpoint
  api/admin/*            Editor API (session + role checked on every request)
src/components/          Shared UI (header, footer, forms, cookie consent…)
src/lib/content/schema.ts     Every editable page: its fields and default copy
src/lib/content/legal-defaults.ts  Legal page drafts
src/lib/forms/definitions.ts  Default form questions (+ Google Sheet column mapping)
src/lib/forms/submit.ts       Submission pipeline: validation, spam checks, storage, Sheets, email
src/lib/integrations/    Google Sheets + email
integrations/google-apps-script/  Apps Script for the response sheet
seed/                    Logo (background removed), hero image, seed media
scripts/                 create-admin, backup, render-og
tests/                   End-to-end tests (Playwright), mock Sheets endpoint
deploy/                  Docker Compose + Caddy (automatic HTTPS)
```

## Testing

```bash
npm run build
node tests/mock-sheets.mjs /tmp/mock-sheet.json &           # stand-in for the Apps Script
DATA_DIR=./data-test ADMIN_PASSWORD='TestOwnerPass-2026!'  npm run admin:create -- --email owner@test.local --name "Test Owner"
DATA_DIR=./data-test ADMIN_PASSWORD='TestEditorPass-2026!' npm run admin:create -- --email editor@test.local --name "Test Editor" --role editor
tests/serve-test.sh &
BASE=http://localhost:3000 DATA_DIR=./data-test MOCK_SHEET=/tmp/mock-sheet.json python3 tests/e2e.py
```

The suite (149 checks) covers every route at 360/390/768/1024/1440 px, axe WCAG 2.2 AA scans, every form,
duplicate and spam handling, cross-site request blocking, the editor's draft/preview/publish flow, roles,
webinar registration, gated downloads, cookie consent behaviour, unsubscribe, security headers and SEO tags.
Use a separate `DATA_DIR` — never run tests against live data.
