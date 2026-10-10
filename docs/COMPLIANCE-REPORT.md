# Compliance implementation report

This report describes what was **technically implemented and tested**. It is not legal advice, and the website
should not be described as "POPIA compliant" or "fully compliant" until a qualified South African legal professional
has reviewed it and the business information has been supplied. Compliance also depends on how the team handles data
after it leaves the website (inboxes, Google Sheets, WhatsApp).

## 1. Implemented

### POPIA (Protection of Personal Information Act)
- **Minimality**: each form collects only what its purpose needs. No ID numbers, banking details or special personal information.
  TenderIQ's business size, challenges and interests are optional.
- **Notification at collection (s18)**: every form has a required acknowledgement linking to the privacy notice (opens in a new tab so
  answers aren't lost). The privacy notice lists each form, what it collects and why.
- **Privacy notice draft** covering: responsible party, Information Officer, categories and purposes, lawful basis, operators
  (hosting, Google, email, analytics), cross-border transfers (s72), retention, security, data subject rights (access, correction,
  deletion, objection, withdrawal), and complaints to the Information Regulator. Business details fill in automatically from Settings.
- **Records**: privacy acknowledgement time, source page and submission time are stored with each submission.
- **Security safeguards (s19)**: see §1 Security below.
- **Data subject requests**: "Privacy or data request" contact category (linked from every footer); owners can view, export and
  permanently delete a person's submission and consent record.
- **Retention**: configurable period (default 24 months) with a one-click clean-up; consent records kept for proof.
- **Access control**: personal information is visible only to owner accounts. Editors can't see submissions.
- **No personal information** in analytics, URLs, browser storage or server logs (logs record submission IDs and error types only).
  IP addresses are stored only as a salted one-way fingerprint for abuse prevention.

### Direct marketing (POPIA s69)
- Marketing consent is a **separate, optional, unticked** checkbox on each form. Registering, enquiring or downloading never
  depends on it (tested).
- Each consent stores the **exact wording**, a **wording version** and a **timestamp** (tested). Brand-specific wording for
  Majesty Method and TenderIQ.
- **Unsubscribe**: signed, per-person links (exported with the subscriber list) open a confirmation page; forged links are rejected
  (tested). Owners can also record unsubscribes manually.
- Service messages (acknowledgements) contain no marketing.

### Cookies
- The site currently sets **only essential cookies** (`mm_consent` for the visitor's choice; `mm_session`/`mm_preview` for signed-in
  editors only). With no optional cookies in use, **no banner is shown**, and "Cookie settings" in every footer explains this (tested).
- If analytics (GA4) is enabled in Settings: a banner offers **Accept / Reject / Settings** with equal prominence; **nothing loads
  before consent** (tested — no request to Google before acceptance or after rejection); choices persist for 12 months and can be
  changed any time; changing the cookie consent version re-prompts. Rejecting later removes `_ga` cookies.
- The cookie policy's table is **generated from the live configuration**, so it can't drift from reality (tested with and without GA).
- No embedded third-party players, maps or social widgets.

### ECTA (Electronic Communications and Transactions Act, s43 supplier information)
- Footer and legal pages show business name, legal status, registration number, VAT number (if set), physical and postal address,
  email and telephone — all from Settings. They're **placeholders until supplied** and are hidden from the footer while still placeholders.
- No online transactions are offered, so price/payment/delivery/cancellation disclosures aren't yet triggered. They must be added
  before any payment feature (see Handover §6).

### Consumer Protection Act
- No fabricated testimonials, statistics, guarantees or prices. TenderIQ copy states it doesn't guarantee qualification, awards
  or complete coverage, and that official tender documents prevail. The TenderIQ scenario is labelled illustrative.
- The Acceleration page makes no cost, funding or placement promises; terms are confirmed in writing.
- Website terms avoid excluding rights that can't be excluded and are marked for legal review.

### PAIA
- PAIA information page with contact details, request procedure (Form 2 via the Information Regulator) and a placeholder for
  whether a manual is required.

### Security
- HTTPS (HSTS in production); CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy headers (tested).
- Server-side validation of every form and every editor save; editor content sanitised (e.g. `javascript:` links stripped — tested);
  Markdown output sanitised.
- Cross-site request blocking on all form and admin endpoints (tested); SameSite=Strict, HttpOnly session cookies (tested).
- Spam/abuse: signed form tokens, minimum fill time, honeypot, per-connection rate limits (tested), login rate limits.
- Duplicate protection with idempotency keys (tested); the Sheets bridge also deduplicates.
- Passwords hashed with scrypt; role-based access; disabling a user ends their sessions; audit log of admin actions.
- Private resource files stored outside the web root and served only through signed, expiring links (tested).
- Secrets only in server environment variables; none in page HTML or browser bundles (tested). Production refuses to start without
  a strong `APP_SECRET` (tested).
- Uploaded SVGs with scripts rejected; SVGs served with a sandboxing CSP. Image metadata (EXIF, incl. GPS) stripped on upload.
- CSV exports neutralise spreadsheet formulas.

### Accessibility (target WCAG 2.2 AA)
- Semantic landmarks and headings, skip links, visible focus, keyboard-operable menu (Escape closes and returns focus), native
  `<dialog>` for cookie settings, labelled fields with required/optional text, error summary with links to fields, `aria-invalid`
  and described-by errors, live regions for status, 44px+ touch targets, reduced-motion support, contrast-checked colour tokens
  (muted text and gold text darkened from the suggested palette to pass 4.5:1).
- axe-core scans (WCAG 2.0/2.1/2.2 A and AA rules) on all 13 public pages: no serious or critical violations. Lighthouse
  accessibility 100 on the pages measured. One issue found and fixed during testing (logo link name not matching visible text).

## 2. Tested
All items marked "tested" above are covered by `tests/e2e.py` (149 checks passing) or the Sheets outage test described in the Handover.
Automated testing can't establish full WCAG conformance; a manual screen reader pass (NVDA/VoiceOver) is recommended.

## 3. Still requires configuration
- Business identification details and Information Officer (Settings).
- Hosting provider and location, email provider → privacy notice operators section.
- Google Apps Script deployment; SMTP (optional); analytics (optional).
- Operator agreements with Google, the host and the email provider (POPIA s21) — usually their standard data processing terms.

## 4. Business information you must provide
See Handover §4.

## 5. Requires review by a qualified South African legal professional
1. Privacy notice — lawful bases, operator list, cross-border transfer basis (s72) for Google and any non-SA host.
2. Marketing consent wording, and whether any existing contacts (e.g. past Bootcamp registrants) may be marketed to under s69(3).
3. Website terms — especially limitation of liability and the IP clause for free resources.
4. PAIA: whether a manual is required for the business's size and sector, and Information Officer registration.
5. Business Acceleration Programme — employment, learnership/internship and placement arrangements, and how the offer is described.
6. Terms for paid programmes, courses and any future TenderIQ subscription (not drafted — only flagged).
7. Retention period appropriate to each data category.

## 6. Third-party services affecting privacy, cookies or cross-border processing
| Service | Data | Location | Active? |
|---|---|---|---|
| Hosting provider | All website data | Depends on choice — SA hosting avoids a cross-border transfer for the website database | Not yet chosen |
| Google Sheets / Workspace (via Apps Script) | Bootcamp registrations | Google data centres, may be outside SA | Pending setup |
| SMTP email provider | Names, emails, submission contents in notifications | Provider-dependent | Optional, pending |
| Google Analytics 4 | Pseudonymous usage data, only with consent; form contents never sent | Outside SA | Off by default |
| External webinar/booking/registration links | Whatever those services collect | Provider-dependent | Only if you add them |
| Fonts | None — self-hosted, no requests to Google Fonts | — | — |
