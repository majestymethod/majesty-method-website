# Deployment

The site is a Node.js application that stores its data in one folder (`DATA_DIR`): the SQLite database,
uploaded images and private resource files. It needs:

- a server that runs continuously with a **persistent disk** (not a serverless platform such as Vercel or Netlify Functions,
  which don't keep files between requests);
- HTTPS;
- daily backups of `DATA_DIR`, copied somewhere else.

## Choosing a host

| Option | Notes |
|---|---|
| **A small VPS hosted in South Africa** (1 vCPU, 1–2 GB RAM is enough) | Keeps the website database in South Africa, which simplifies the privacy notice. Use the Docker setup below. |
| **A platform with persistent volumes** (e.g. Render, Railway, Fly.io) | Less server administration. Check the region (Fly.io offers Johannesburg) and that a persistent volume is attached at `DATA_DIR`. |

Check current prices with the provider; this site's requirements are modest. There is no CMS subscription.
Whatever you choose, list the host in the privacy notice (it's a placeholder there).

## Environment variables

Copy `.env.example` to `.env` and fill it in. Never commit `.env`.

| Variable | Required | Purpose |
|---|---|---|
| `SITE_URL` | Yes | e.g. `https://www.majestymethod.com` — canonical URLs, sitemap, links in emails |
| `APP_SECRET` | Yes | 32+ random characters. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. The site refuses to start in production without it. Changing it invalidates existing unsubscribe and download links. |
| `DATA_DIR` | Yes | Persistent folder for data (Docker setup uses `/data`) |
| `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET` | For Google Sheets | See `integrations/google-apps-script/README.md` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | For email | Any SMTP provider (Google Workspace, Microsoft 365, Postmark, Brevo…). Set up SPF/DKIM on your domain so emails don't land in spam. |

## Option A: Docker on a VPS (recommended)

```bash
# on the server, with Docker installed and your domain's DNS pointing at it
git clone <your repository> site && cd site
cp .env.example .env && nano .env            # fill in values; DATA_DIR is set by compose
nano deploy/Caddyfile                         # replace the domain names
cd deploy && docker compose up -d --build     # Caddy obtains HTTPS certificates automatically
docker compose exec web npm run admin:create -- --email you@majestymethod.com --name "Your Name"
```

Updating after code changes: `git pull && cd deploy && docker compose up -d --build`. Data in the `site-data` volume is kept.

> The Docker files were written to the same setup used for testing but haven't been run in a Docker environment here.
> Do a trial deployment before launch day.

## Option B: Node directly

```bash
npm ci && npm run build
npm run admin:create -- --email you@majestymethod.com --name "Your Name"
npm start            # port 3000; run under systemd or pm2 and put Nginx/Caddy in front for HTTPS
```

## Backups

`npm run db:backup` writes a consistent copy of the database plus images and private files to `DATA_DIR/backups/<timestamp>`
and keeps the latest 14. Schedule it daily (cron: `15 2 * * * cd /path/to/site && npm run db:backup`, or
`docker compose exec web npm run db:backup`) and **copy the backups off the server** (e.g. to cloud storage).

**Restore**: stop the site, replace `site.db`, `media/` and `private/` in `DATA_DIR` with a backup's contents, start the site.
Test a restore once before launch.

## Going live checklist

1. Fill in every item on the editor dashboard ("Before launch" and "Placeholders").
2. Legal review of the four legal pages, then set each to "Reviewed".
3. Set up Google Sheets and send a test Bootcamp registration.
4. Set up email (optional) and send a test contact message.
5. Submit `https://yourdomain/sitemap.xml` in Google Search Console.
6. Delete the three `[EXAMPLE …]` draft items (webinar, course, resource) or replace their content.
7. Confirm backups are running and stored off the server.

## Security notes

- All admin actions require a signed-in session (HttpOnly, Secure, SameSite=Strict cookie, 7-day expiry) and are checked
  on the server. Cross-site requests are rejected. Sign-in attempts are rate limited.
- Passwords are hashed with scrypt. Each person should have their own account.
- Form endpoints validate everything server-side, use a signed form token, a honeypot and per-connection rate limits.
- Rate limits are held in memory; if you ever run several server instances, move them to a shared store.
- Security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) are set for every page.
- Keep the server and Node.js updated, and run `npm audit` periodically.
