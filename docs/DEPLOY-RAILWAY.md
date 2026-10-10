# Putting majestymethod.com live on Railway

About 30–45 minutes, mostly clicking. You do the account, payment and password steps yourself; nothing here needs a terminal.

**What it costs:** Railway's Hobby plan is $5/month and includes $5 of usage. A site this size normally stays within that, plus a few cents for the storage volume. Check Railway's pricing page for current figures.

**What you need:** a GitHub account, a Railway account, your Squarespace login (for DNS), and about 15 minutes for the web address to switch over.

---

## 1. Put the code on GitHub (private)

1. Create a GitHub account at github.com if you don't have one.
2. Click **New repository** → name it `majesty-method-website` → choose **Private** → leave everything else unticked → **Create repository**.
3. Upload the code. Either:
   - connect GitHub to Claude and ask Claude to push it for you, or
   - on the new repository page, click **uploading an existing file**, drag in the *contents* of the unzipped project folder, then **Commit changes**.

Never upload a `.env` file or anything from a `data` folder. They are excluded already.

## 2. Create the Railway project

1. Go to railway.com → **Login with GitHub** → choose the **Hobby** plan and add your card.
2. **New Project** → **Deploy from GitHub repo** → allow Railway to see `majesty-method-website` → select it.
3. Railway starts a first build straight away. It will fail or warn until steps 3 and 4 are done. That's expected.

The build and start settings come from `railway.json` in the code, so you don't need to type any commands.

## 3. Attach storage (essential)

Your pages, edits, uploads and form entries live in a small database file. Without a volume, it would be wiped on every update.

1. In the project canvas, right-click (or press **Ctrl/⌘ K**) → **Volume** → attach it to the website service.
2. Mount path: **`/data`**.

The site detects the volume automatically, so you don't need to set `DATA_DIR`.

## 4. Add the settings (Variables tab of the service)

| Variable | Value |
|---|---|
| `SITE_URL` | `https://www.majestymethod.com` |
| `APP_SECRET` | A long random string, 32+ characters. Click **Generate** if offered, or use a password manager to make a 48-character password. Keep it secret. |
| `ADMIN_EMAIL` | the email you'll sign in to the editor with |
| `ADMIN_NAME` | your name |
| `ADMIN_PASSWORD` | a strong password, 12+ characters (temporary; see step 6) |
| `SHEETS_WEBHOOK_URL` | Apps Script web-app URL (see `integrations/google-apps-script/README.md`); leave out until ready |
| `SHEETS_WEBHOOK_SECRET` | the same secret you put in the Apps Script; leave out until ready |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | optional email notifications; see `.env.example` |

Railway sets `PORT` itself, so don't add it.

Click **Deploy** (or **Apply changes**). When the deployment turns green, open **Settings → Networking → Generate Domain** to get a temporary `…up.railway.app` address and check the site works there.

## 5. Connect www.majestymethod.com

### In Railway

**Settings → Networking → Custom Domain** → enter `www.majestymethod.com`. Railway shows two records to add:

- a **CNAME**: host `www` → a target like `abc123.up.railway.app`
- a **TXT**: host like `_railway-verify.www` → a long value

Keep that tab open.

### In Squarespace

Go to **Domains → majestymethod.com → DNS → DNS Settings**.

1. **Keep** every record that mentions Google: the **MX** record `smtp.google.com` and any **TXT** records such as `v=spf1…` or `google-site-verification…`. These run your company email.
2. **Delete** the **Squarespace Defaults** record group (the four `A` records on `@` and the `www` CNAME pointing to `ext-sq.squarespace.com`).
3. **Add record**: type **CNAME**, host `www`, data = Railway's CNAME target.
4. **Add record**: type **TXT**, host = Railway's TXT host (e.g. `_railway-verify.www`), data = Railway's TXT value.

Within roughly 5–60 minutes Railway shows the domain as verified and issues the HTTPS certificate automatically.

### The bare address (majestymethod.com without www)

Railway can't attach a bare domain while Squarespace runs your DNS, because Squarespace doesn't support the record type it needs. Send it to www instead:

- **Option A (simplest):** in Squarespace, set **domain forwarding** for `majestymethod.com` → `https://www.majestymethod.com` (permanent / 301). Then test **both** `http://majestymethod.com` and `https://majestymethod.com` in a private browser window. Squarespace's forwarding is reliable on http but not always on https. If https shows a certificate warning, use option B.
- **Option B (most robust, free):** move DNS to Cloudflare.
  1. Create a free Cloudflare account and add `majestymethod.com`. It imports your existing records.
  2. Check that the Google MX/TXT records came across.
  3. In Squarespace, change the nameservers to the two Cloudflare gives you.
  4. In Railway, add `majestymethod.com` as a second custom domain and create its CNAME/TXT in Cloudflare with **DNS only** (grey cloud).
  5. Ask Claude to add a redirect from the bare domain to www.

## 6. First sign-in

1. Visit `https://www.majestymethod.com/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. Back in Railway → Variables: **delete `ADMIN_PASSWORD`** (and you can delete `ADMIN_EMAIL` / `ADMIN_NAME`).

The account is created only when the site has no users. Leaving or changing these variables later never resets anyone's password. Change your password under **Account**, and add editors under **Users**.

## 7. Updating the site later

Every change pushed to the GitHub repository redeploys automatically. Content edits made in `/admin` are stored on the volume and survive redeploys.

**Backups:** open the volume in Railway → **Backups** and turn on a daily schedule. Form entries can also be exported from **Admin → Submissions**, and they're copied to your Google Sheet once that is connected.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Deploy fails with "APP_SECRET must be set…" | Add `APP_SECRET` (32+ characters) in Variables. |
| Logs say "No Railway volume is attached" | Do step 3, then redeploy. |
| Edits disappeared after an update | The volume wasn't attached, or its mount path isn't `/data`. |
| Domain stuck on "waiting for DNS" | Check that the CNAME host is exactly `www` and the TXT host matches Railway's. Remove any leftover Squarespace `www` record. Wait up to an hour. |
| Email stopped working | A Google MX/TXT record was deleted. Re-add `MX 1 smtp.google.com` (see Google Workspace admin → Domains). |
