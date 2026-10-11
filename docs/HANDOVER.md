# Handover: what's built, what's pending, what you need to supply

## 1. What has been built and tested

| Deliverable | Status |
|---|---|
| Brand entry page with full-width hero, official logo (background removed) and two destinations | Built, tested |
| Majesty Method homepage (9 sections, emerald + gold) | Built, tested |
| Founder Bootcamp page + registration form | Built, tested |
| Bootcamp → Google Sheet integration | Built, tested against a mock with your sheet's real headers. **Needs the Apps Script deployed** (§3) |
| Webinars page: listings, per-session registration or external link, joining instructions, recordings, empty state | Built, tested |
| Business Acceleration page + discovery-call enquiry (no fake calendar) | Built, tested |
| Courses page (editable catalogue, empty state) | Built, tested |
| Free resources library with private, optionally registration-gated downloads | Built, tested |
| TenderIQ homepage (royal purple + gold) + registration of interest | Built, tested |
| Contact page + enquiry routing; contact links at the end of every service page | Built, tested |
| Privacy notice, cookie policy, website terms, PAIA page | Drafted with placeholders; **need legal review** |
| Cookie consent (only appears when non-essential cookies are enabled) | Built, tested both with and without analytics |
| Marketing consent records (wording, version, time), unsubscribe links, withdrawal | Built, tested |
| Content editor: pages, lists, images, webinars, courses, resources, forms, navigation, SEO, users, roles, draft/preview/publish | Built, tested |
| Submissions inbox with CSV export, retry, deletion, retention clean-up | Built, tested |
| SEO: unique titles/descriptions, canonical URLs, sitemap, robots, Open Graph images per brand, favicon | Built, tested |
| Responsive layouts at 360/390/768/1024/1440 | Tested, no horizontal overflow |
| Accessibility (WCAG 2.2 AA target) | axe scans on all 13 public pages: no serious/critical issues. Keyboard menu, focus states, labelled forms, error summaries |
| Deployment files (Docker + automatic HTTPS) | Written; not yet run in a Docker environment |

**Measured** (Lighthouse, mobile emulation with throttling, production build): Performance 96–99, Accessibility 100,
Best Practices 100, SEO 100 on the entry, Majesty Method, TenderIQ and contact pages. Largest Contentful Paint 1.7–2.6 s.
Real-world numbers will depend on the hosting location — hosting in or near South Africa helps.

**Automated test suite**: 149 checks, all passing (see README → Testing). A Google Sheets outage was also simulated:
the registration was saved and confirmed, marked "Sheet failed" with the reason, and a retry added exactly one row.

## 2. Decisions I made for you (easy to change)

- **Bootcamp form questions** mirror your *OCTOBER 26 VISIBILITY BOOTCAMP REGISTRATION FORM* response sheet, column for column.
  I added one optional question — the employee's email address — because your existing answer option asks people to include it.
  It goes into a "Website: additional answers" column so your existing columns stay untouched.
- **Contact details** (admin@majestymethod.com, +27 81 041 1602, Johannesburg) come from your October Bootcamp calendar.
  The WhatsApp link uses the same number. Change them in Business details if needed.
- **TenderIQ form** is the lighter "register interest" form from the brief, not your detailed *Tender IQ – Company Registration*
  onboarding form. That form mentions weekly reports and subscription renewal dates; the site doesn't claim either until you confirm
  what TenderIQ offers. You could link to the onboarding form from the TenderIQ confirmation message once you're ready.
- **Hero imagery** is an original generated image (ivory marble, a single gold vein, arched window light) — no stock photography.
  The arch motif is repeated on the Majesty Method homepage. Replace it any time under Pages → Entry page.
- **Fonts**: Bodoni Moda (Majesty Method headings) and Hanken Grotesk (everything else, and all TenderIQ headings). Both are free
  for commercial web use under the SIL Open Font Licence and are served from your own domain.
- The TenderIQ page shows an **illustration** of a tender with summarised requirements. It's captioned "Illustration of the intended
  experience. Not a real tender." Remove or replace it if it doesn't match how TenderIQ will work.

## 3. Accounts, credentials and setup still needed

| Item | Why | Where |
|---|---|---|
| Hosting with a persistent disk + your domain's DNS | To put the site online | docs/DEPLOYMENT.md |
| `APP_SECRET`, `SITE_URL` | Required to start in production | `.env` |
| Google Apps Script deployment on the response sheet → `SHEETS_WEBHOOK_URL` + `SHEETS_WEBHOOK_SECRET` | Bootcamp rows in your sheet | integrations/google-apps-script/README.md |
| SMTP account (optional) + SPF/DKIM on your domain | Acknowledgement and team-notification emails. Without it, use the Submissions inbox. | `.env` |
| Discovery-call booking link (optional) | Adds "Choose a time" next to the Acceleration enquiry form | Business details |
| GA4 measurement ID (optional) | Analytics, loaded only after consent | Business details → Analytics |
| Your first owner account | Editor access | `npm run admin:create` |

## 4. Business information to supply

Everything below appears as a **[PLACEHOLDER]** on the dashboard until replaced.

- Registered business name, legal status, company registration number, VAT number (if registered)
- Physical address and postal address for legal notices
- Information Officer name and email (and confirm registration with the Information Regulator)
- Hosting provider and its server location; email provider (for the privacy notice)
- Bootcamp fee and payment terms (FAQ), and optionally duration/format/next cohort facts
- Social media profile links
- **Confirm three Bootcamp answer option lists** (Forms → Founder Bootcamp registration). Google wouldn't export the form itself,
  so I inferred them from existing responses:
  - Employees: `1 (Just me)`, `2 - 4 employees`, `5 - 10 employees`, `More than 10 employees`
  - Social media: `Yes`, `No` — one existing response reads "I have social media platforms that I manage myself", so the real form
    may have more options
  - Who does your marketing: `Me`, `An employee in my business (include their email address…)`, `An agency or freelancer`, `Nobody at the moment`
- Courses, webinars and free resource files you want published (three `[EXAMPLE]` drafts show the format; none are public)
- A TenderIQ logo, if there is one (the site uses a "TenderIQ" wordmark until then)
- Acceleration Programme commercial terms (the page says they're confirmed in writing before commitment, and makes no cost claims)

## 5. Needs legal review before launch

See docs/COMPLIANCE-REPORT.md §5. In short: all four legal pages, the consent wording, the Acceleration Programme
positioning (graduate placement), and whether a PAIA manual is required.

## 6. Not built (by design or out of scope)

- **Online payments** for courses/programmes. The course model already has price and button-link fields; a payment provider
  (e.g. PayFast, Paystack, Yoco) can be added later without rebuilding. Adding payments brings ECTA s43 and CPA disclosure duties
  (refunds, cancellations, delivery) that must be on the site first.
- **The TenderIQ application itself**, accounts or tender data. The page and registration are ready for it.
- **Sending marketing emails**. Use your email marketing tool with the consent export and its unsubscribe links.
- **Automatic retention clean-up** runs when an owner presses "Apply retention" (monthly is sensible), not on a timer.

## 7. Remaining known issues

- Rate limiting is in memory per server instance — fine for one server; needs a shared store if you scale to several.
- If Google Sheets is unreachable, submissions are kept and marked; someone needs to press **Retry Google Sheets**
  (shown on the dashboard when anything is waiting).
- Real-device testing (iPhone Safari, Android Chrome on a slow connection) is still worth doing before launch;
  testing here used Chromium at the five target widths.

---

## Version 2 refinements (10 October 2026)

**Design**: one white-stone background on every page (no beige), Poppins throughout, new Majesty Method palette
(deep emerald, forest green, dark turquoise, gold, onyx) and TenderIQ palette (royal purple, dark purple, onyx, gold).
Panels, cards, forms, buttons and images now have rounded corners and a subtle gloss. Colours, radii and the gloss
are central tokens at the top of `src/app/globals.css`; the texture is `public/textures/white-stone.webp`.

**Photographs used** (all editable in the page editor):

| Photo you supplied | Where |
|---|---|
| Curved building | Entry page background, shown in black and white |
| You in the emerald suit (selfie) | Majesty Method homepage, captioned "Majesty Method Founder: Adelade Nyarirangwe" |
| "Think bigger" newspaper | Founder Bootcamp |
| Team around the strategy table | Business Acceleration |
| Woman in the cream dress | Webinars page |
| Social apps on a phone | Courses page |
| "Break the internet" phone | Free resources page |
| Poster and brand board | Reference for look and feel (palette, tagline "Strategy. Power. Elevation.") |

**Still needed from you**
- **Three TenderIQ industry photographs** (construction/infrastructure, supply and delivery, logistics/commercial
  services). Photo libraries are blocked from my workspace, so the page shows three clearly labelled
  "Photograph to come" panels. Upload them in Pages → TenderIQ homepage → Industry photographs.
- Please **confirm the founder photo** is the one you want, and that you have permission to use the photo of the
  woman in the cream dress on the webinars page (if she isn't you).
- Optional: the logo lockup as a transparent PNG/SVG file. The entry page currently pairs your monogram with the name
  and tagline set in Poppins.

**Content decisions**
- TenderIQ's "What TenderIQ is designed to help you do" now has seven blocks. Five are the original outcomes; the two
  added ones ("Spend less time screening", "Focus on stronger submissions") restate the positioning in your original brief
  and don't claim new features. Edit or remove them if you prefer five.
- The Bootcamp page no longer mentions cost anywhere. The "How to Get Started" steps say payment details are shared
  after the webinar, and that registering doesn't confirm a place.
- Keyword brief received and applied — see docs/SEO.md.

**If you already used version 1 locally**: page copy is stored in the database, so pages you'd edited keep your text.
To pick up the new default copy for a page, open it in the editor and use **Reset to default**, then **Publish**.

---

## House of Majesty (entry page and site-wide design, v3)

### The entrance
Two artworks, in `seed/house/`: the exterior (corridor, glass doors, emerald ribbon, gold seal) and the interior
(lobby with the emerald Majesty Method pathway and the purple TenderIQ pathway).
`scripts/prepare-house.py` cuts the exterior into layers in `public/house/` (a ribbon-free base, the two glass
doors, two ribbon halves and the seal), makes responsive copies of the interior, and records positions and the
clickable pathway areas in `src/components/house-layout.json`. The component is `src/components/HouseEntrance.tsx`.

Sequence (about 2 seconds): the seal presses and lifts away → the ribbon halves release outward → the glass doors
slide into the walls and the lobby appears through the gap → the view moves through the doorway and the lobby fills
the screen → the two pathways become links (Majesty Method → `/majesty-method`, TenderIQ → `/tenderiq`).

- Tapping the ribbon, the seal or the doors (which carry "Tap to enter" in the artwork) opens it; so does Enter/Space
  on the ribbon button. Escape or a second click skips the animation.
- Hovering or focusing a pathway lights its sign and runner and dims the other side. Each pathway has a visible
  Enter button (its supporting label + "Enter").
- "Back to the entrance" returns to the closed doors.
- Phones and portrait or square screens: the lobby is seen through the door, then becomes two panels, one per
  pathway (stacked on phones, side by side on squarer tablets).
- Reduced motion, the "Skip to the two destinations" link and returning in the same browser session open it instantly.
  Without JavaScript the lobby and both pathways are shown directly.
- Text you can edit: Pages → Entry page (House of Majesty entrance): the heading inside, the back button, the
  pathway names (read by screen readers) and supporting labels (shown on the Enter buttons), and the page heading.
- Replacing either artwork needs a developer: the ribbon, seal, doors and pathways are traced for these images.

### Site-wide design ("House of Majesty")
The page background stays white stone everywhere. Colour lives in contained, rounded, glossy elements:
- Flagship heroes (Majesty Method home, Founder Bootcamp, TenderIQ) and selected feature sections ("What we
  believe", "What Majesty Method provides", the Bootcamp, Acceleration and TenderIQ registration areas) sit in rich
  emerald, onyx or purple panels with a warm downlight, a fine gold (or lavender) edge and, on heroes, two fine
  light lines like the lit pillars. Cards inside these panels become glass cards with a hairline edge.
- Other heroes (Acceleration, webinars, courses, resources, contact) are white marble with a warm light, a fine gold
  line beneath and a gold double frame around the photo. The founder portrait has an arched "portal" top.
- Buttons: emerald (Majesty Method) or purple (TenderIQ) with white text and a fine lit edge; metallic gold on dark
  emerald panels; white on purple panels; outlined on dark. Hover lifts slightly; pressed settles.
- Header: white with a fine gold (or purple) hairline; the current page is underlined. Footer: onyx with a gold
  (Majesty Method) or lavender (TenderIQ) hairline.
- Feature cards carry a fine illuminated line along the top; forms carry one too.
- Tokens (colours, light, shadows, radii, motion) are at the top of `src/app/globals.css`; section colours are
  applied with `.surface--emerald`, `.surface--purple` or `.surface--onyx` on a `<section>` (the colour goes on
  its inner panel, never the page).
