# Editing the website yourself

Sign in at **yourdomain/admin**. Everything below is done from there — no developer needed.

## The basics: draft, preview, publish

Every page works the same way:

1. Open **Pages** and choose the page.
2. Change the text, images or lists. **Save draft** keeps your work without changing the live site.
3. **Preview** opens the page in a new tab exactly as visitors will see it, with a dark bar at the top
   reminding you it's a preview. Only signed-in team members can see drafts.
4. **Publish** makes it live. Refresh the public page to see it.

If you change your mind, **Discard draft** throws away unpublished changes. **Reset to default** restores the
original copy written for the launch (you still need to publish it).

**Business details** is the exception: it saves and goes live immediately, because the same details are used
across every page.

## What you can edit

| You want to change… | Go to |
|---|---|
| The entry page statement, background photograph (black-and-white switch), the two block labels | Pages → Entry page |
| Founder photograph and caption, who we help, beliefs, ways to work | Pages → Majesty Method homepage |
| TenderIQ industry photographs (three) | Pages → TenderIQ homepage → Industry photographs |
| Majesty Method homepage sections (hero, philosophy, transformation, paths, webinars band, Teach/Build/Strategise, closing) | Pages → Majesty Method homepage |
| Bootcamp photo, copy, facts, curriculum, who should join, How to Get Started steps, FAQs | Pages → Founder Bootcamp |
| Acceleration Programme copy, steps, suitability, terms note | Pages → Business Acceleration Programme |
| TenderIQ copy, problems, outcomes, example, steps, trust statements | Pages → TenderIQ homepage |
| Menu links and menu buttons for both brands | Pages → Navigation menus |
| Logo, contact details, WhatsApp, social links, company registration details, Information Officer, booking link, consent wording, analytics | Business details |
| Privacy notice, cookie policy, website terms, PAIA page | Pages → Legal |
| Search titles and descriptions, share images | The "Search & sharing" box at the bottom of each page |
| Webinars | Webinars |
| Courses | Courses |
| Free resources (PDFs, templates…) | Free resources |
| Form questions, answer options, confirmation messages, notification emails | Forms |

**Lists** (principles, curriculum weeks, FAQs, steps…): use **Add**, the ↑ ↓ arrows to reorder, and **Remove**.
Fields marked "one per line" turn each line into a separate bullet.

**Images**: click **Choose image**, then pick one from the library or **Upload new**. Add alternative text that describes
the image for people using screen readers (leave empty only if the image is purely decorative). Large images are resized
automatically. To replace the logo, upload it under **Business details → Majesty Method logo** (a PNG with a transparent
background works best).

## Webinars

1. **Webinars → Add webinar**.
2. Enter the title, topic, description and **date and start time in South African time**.
3. Choose **Registration**:
   - **internal** — people register on this website. Their details appear under Submissions, and the
     **Joining instructions** are shown to them straight after they register (and emailed, if email is set up).
   - **external** — the Register button links to another page (e.g. Zoom or Eventbrite registration).
4. **Publish**. The session appears on the webinars page, sorted by date, and disappears automatically once it's over.
   Add a **Recording link** afterwards and it appears under "Recordings".

When no sessions are published, the page invites people to leave their details for updates.

## Courses

**Courses → Add course.** Only fill in duration and price once they're confirmed — empty fields are simply not shown.
Leave the button link empty and the button sends people to the contact form with the course name filled in.
When you're ready to sell courses online, a payment provider can be added (see Handover).

## Free resources

1. **Free resources → Add resource.** Upload the file (PDF, Word, Excel, PowerPoint, ZIP, images).
2. Tick **Ask for name and email before download** to collect a registration first. Visitors then get a download
   button valid for 24 hours. Files are stored privately and can't be reached by guessing an address.
3. Publish.

## Forms

**Forms** lets owners change each form's questions, answer options, required/optional, help text, confirmation
messages, who gets notified and the acknowledgement email.

- **Adding a question**: Add question → set the wording and answer type. New questions apply to new submissions;
  past answers are unaffected.
- **System questions** (name, email, enquiry type) can be reworded but not removed — the site relies on them.
- **Bootcamp → Google Sheet**: each question has a "Google Sheet column header". It must match the sheet's column
  header exactly. Questions without one go into a "Website: additional answers" column.
- **Contact form routing**: e.g. `TenderIQ = tenders@yourdomain.co.za` sends TenderIQ enquiries to that address.
- **Options to confirm**: three Bootcamp questions show an orange "Options to confirm" badge (see Handover). Check
  them against your Google Form, adjust if needed, then untick "Options still to confirm".

## Submissions (owners only)

Every form submission lands here first, whatever else is set up.

- Filter by form or status; search by name or email.
- Open a submission to see the answers, whether the person agreed to marketing (and the exact wording), and whether
  it reached Google Sheets and email.
- Set the status to **Reviewed** once someone has followed up.
- **Export CSV** (choose a form first) for use in a spreadsheet.
- **Retry Google Sheets** resends anything that didn't reach the sheet (e.g. during a Google outage).
- **Delete permanently** on a submission is for deletion requests. Also delete any copy in Google Sheets or your inbox.
- **Apply retention** deletes submissions older than the period in Business details (24 months by default).

## Marketing consent (owners only)

Lists everyone who ticked the marketing box, with the wording they agreed to and when.
**Export active subscribers** gives you a CSV with a personal unsubscribe link for each person — include that link
in every marketing email. If someone asks to unsubscribe by phone or email, use **Record unsubscribe**.

Only send marketing to people who are **Active** here. People who registered for a programme without ticking the
box should only receive messages about that programme.

## Users (owners only)

- **Owners** can do everything, including seeing submissions and changing business details, forms and users.
- **Editors** can edit pages, webinars, courses, resources and images, but can't see personal information.

Give each person their own account. Disable accounts when someone leaves. Change your password under **My account**.
If every owner is locked out, the server administrator can run `npm run admin:create -- --email … --name …` to reset.

## Before launch: the dashboard checklist

The dashboard shows which services are configured and lists every **[PLACEHOLDER]** still visible on the published site.
Work through it until it's empty (see also docs/HANDOVER.md).

## Things that need a developer

- Adding a completely new page type or section layout.
- Changing colours, fonts or spacing.
- Adding online payments for courses.
- Connecting TenderIQ's actual product once it's ready.
