# Google Sheets bridge (Bootcamp registrations)

The website saves every registration in its own database first. This Apps Script then copies
each Bootcamp registration into your existing **OCTOBER 26 VISIBILITY BOOTCAMP REGISTRATION FORM (Responses)**
sheet, in the **Form responses 1** tab, so your current workflow keeps working.

Values are matched to columns by **header text**, so the column order can change safely.
If a header is renamed in the sheet, update the matching "Google Sheet column header" in
the website editor (Forms → Founder Bootcamp registration).

## Column mapping

| Sheet column | Website question |
|---|---|
| Timestamp | Submission time (written as a real date) |
| Email address | Email address |
| NAME AND SURNAME | Name and surname |
| EMAIL ADDRESS | Email address |
| PHONE NUMBER (WHATSAPP) | Phone number (WhatsApp) — stored as text, keeps the leading 0 |
| BUSINESS NAME AND DESCRIPTION | Business name and description |
| IS YOUR BUSINESS REGISTERED | Is your business registered? |
| HOW MANY EMPLOYEES DOES YOUR BUSINESS HAVE | How many employees… |
| Do you have social media platforms for your business | Do you have social media platforms… |
| Who is currently doing your marketing? | Who is currently doing your marketing? |
| Website: additional answers *(added automatically on first use)* | Employee’s email address, and any question you add later without a column |

Answer options for employees, social media and marketing were **inferred from existing responses**
because the Google Form couldn’t be exported. Confirm them in the editor (Forms → Founder Bootcamp).

## Setup (about 10 minutes)

1. Open the response spreadsheet → **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with the file in this folder. Save.
3. **Project Settings → Script properties → Add**:
   - `SHARED_SECRET` = a long random string (e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`)
   - `SPREADSHEET_ID` = the ID in the sheet URL: `docs.google.com/spreadsheets/d/<THIS PART>/edit`
4. **Deploy → New deployment → Web app**:
   - Execute as: **Me** (the sheet owner)
   - Who has access: **Anyone** (requests are rejected without the shared secret)
   - Authorise when prompted.
5. Copy the **Web app URL** (ends in `/exec`).
6. On the website server set:
   ```
   SHEETS_WEBHOOK_URL=<the /exec URL>
   SHEETS_WEBHOOK_SECRET=<the same SHARED_SECRET>
   ```
   and restart the site.
7. Test: submit a Bootcamp registration on the site. A new row should appear within seconds.
   In the editor, the submission shows **In sheet**. If it shows **Sheet failed**, the reason is listed
   on the submission page; fix it and press **Retry Google Sheets**.

## Notes

- Never share the web app URL together with the secret.
- A hidden `_website_sync_log` tab records which submissions were copied, so retries never create duplicate rows.
- When you redeploy the script after editing it, choose **Manage deployments → Edit → New version** so the URL stays the same.
- Google stores sheet data on servers that may be outside South Africa. This is covered in the privacy notice draft.
