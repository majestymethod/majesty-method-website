// Runs once when the server starts: refuse to run in production with an unsafe configuration.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return;
  const s = process.env.APP_SECRET;
  if (!s || s === 'change-me' || s.length < 32) {
    throw new Error('APP_SECRET must be set to a random string of at least 32 characters before starting in production.');
  }
  if (process.env.RAILWAY_ENVIRONMENT && !process.env.RAILWAY_VOLUME_MOUNT_PATH && !process.env.DATA_DIR) {
    console.warn('[config] No Railway volume is attached: content, uploads and form entries will be lost on the next deploy. Attach a volume (mount path /data).');
  }
  if (!process.env.SITE_URL) console.warn('[config] SITE_URL is not set; canonical URLs and email links will use http://localhost:3000');
}
