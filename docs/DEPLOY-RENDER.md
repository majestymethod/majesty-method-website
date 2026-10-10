# Going live on www.majestymethod.com (Render + Squarespace DNS)

Time needed: about 45 minutes of clicking, plus up to 24–48 hours for DNS to update (often much faster).

**What you'll end up with**: the site at **https://www.majestymethod.com** (majestymethod.com redirects there),
with automatic HTTPS. Your Google Workspace email (admin@majestymethod.com) keeps working.

**Cost**: Render's smallest paid instance (0.5 CPU / 512 MB, US$7/month at the time of writing) plus a 1 GB disk
(US$0.25/month). Free Render instances can't keep a disk, so they can't keep your content and submissions. Check
render.com/pricing when you sign up.

---

## Step 1 — Put the code on GitHub (private)

Render deploys from a GitHub repository.

1. Create a free account at github.com (use admin@majestymethod.com).
2. Click **New repository** → name it `majesty-method-website` → choose **Private** → **don't** add a README → **Create repository**.
3. Then either:
   - **Let Claude push the code**: in Claude, connect GitHub (Settings → Connectors) and say "push the site to
     `<your-github-username>/majesty-method-website`". Or
   - **Do it yourself** with GitHub Desktop: unzip the project, File → Add local repository → choose the
     `majesty-site` folder (it's already a Git repository) → **Publish repository**, keep it private.

## Step 2 — Create the site on Render

1. Sign up at render.com with your GitHub account.
2. **New** → **Blueprint** → select `majesty-method-website`. Render reads `render.yaml` and proposes:
   - a web service called `majesty-method` in **Frankfurt** (closest region to South Africa),
   - a 1 GB disk mounted at `/var/data` (database, images, resource files),
   - a randomly generated `APP_SECRET`.
3. It asks for `SHEETS_WEBHOOK_URL` and `SHEETS_WEBHOOK_SECRET`. Leave them empty for now (Step 6).
4. Click **Apply**. The first build takes a few minutes. When it says **Live**, open the `…onrender.com` address
   shown at the top. You should see the entry page.

## Step 3 — Create your editor login

1. In Render, open the `majesty-method` service → **Shell**.
2. Run (replace the name/email if you like):
   ```
   npm run admin:create -- --email admin@majestymethod.com --name "Adelade Nyarirangwe"
   ```
3. Type a password of at least 12 characters when asked (nothing shows while you type), then confirm it.
4. Sign in at `https://<your-service>.onrender.com/admin`.

## Step 4 — Connect the domain in Render

1. Service → **Settings** → **Custom Domains** → **Add Custom Domain** → `www.majestymethod.com`.
   Render also adds `majestymethod.com` and redirects it to www.
2. Render shows the records it needs. Normally:
   - `majestymethod.com` → **A** record → `216.24.57.1`
   - `www.majestymethod.com` → **CNAME** → `majesty-method.onrender.com` (use the exact address Render shows)

## Step 5 — Change DNS in Squarespace

Your domain currently points at Squarespace's default website, and your email uses Google (MX record `smtp.google.com`).
Only the **website** records change.

1. Go to **account.squarespace.com/domains** → click **majestymethod.com** → **DNS**.
2. **Before deleting anything**: if you sign in to Squarespace with admin@majestymethod.com, that's fine — the email
   records stay. Just don't touch MX or TXT records.
3. Find the **Squarespace Defaults** records (four A records `198.185.159.x` / `198.49.23.x` and a `www` CNAME to
   `ext-sq.squarespace.com`). Delete that preset with the trash icon. This disconnects any Squarespace website on
   the domain, which is what we want. If there are any **AAAA** records for `@` or `www`, delete those too.
4. **Keep**: the **MX** record (`smtp.google.com`), and any **TXT** records (Google verification, SPF, DKIM).
5. **Add** two custom records:

   | Type | Host | Data |
   |---|---|---|
   | A | @ | 216.24.57.1 |
   | CNAME | www | majesty-method.onrender.com *(exactly as Render shows)* |

6. Back in Render → Custom Domains → **Verify**. Once both show **Verified** and **Certificate issued**, visit
   https://www.majestymethod.com. If verification fails, wait an hour and try again; DNS can take up to 48 hours.
7. Check email still works: send a test message to admin@majestymethod.com from another address.

## Step 6 — Google Sheets for Bootcamp registrations

Follow `integrations/google-apps-script/README.md` (about 10 minutes). Then in Render → service → **Environment**,
set `SHEETS_WEBHOOK_URL` and `SHEETS_WEBHOOK_SECRET` and save (Render redeploys). Submit a test registration and
check the new row in the sheet.

## Step 7 — Optional: email notifications

Render → **Environment** → add `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
(see `.env.example`). With Google Workspace, an administrator can set up the SMTP relay or an app password.
Until then, check new submissions in the editor (Submissions).

## Step 8 — Before announcing the site

- Work through the editor dashboard's **Before launch** list and **Placeholders**.
- Update the privacy notice's hosting placeholder: *Render Services, Inc. — servers in Frankfurt, Germany.*
- Legal review of the four legal pages.
- Delete the three `[EXAMPLE …]` drafts.
- Google Search Console: add `https://www.majestymethod.com`, verify with a TXT record in Squarespace DNS, submit `/sitemap.xml`.

## Day-to-day

- **Content changes**: just use the editor. No redeploys needed.
- **Code changes**: push to GitHub; Render rebuilds automatically. The site is unavailable for a few seconds during each
  deploy (normal for a service with a disk).
- **Backups**: run `npm run db:backup` in the Render Shell and download the backup periodically, and/or check Render's
  disk snapshot options for your plan.
