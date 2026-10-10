import 'server-only';
import crypto from 'node:crypto';

function secret(): string {
  const s = process.env.APP_SECRET;
  if (!s || s === 'change-me' || s.length < 32) {
    if (process.env.NODE_ENV === 'production') throw new Error('APP_SECRET must be set to a random string of 32+ characters.');
    return 'development-only-secret-do-not-use-in-production-0000';
  }
  return s;
}

export function hmac(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Signed, expiring token: payload.expiry.signature */
export function signToken(payload: string, ttlSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = `${Buffer.from(payload).toString('base64url')}.${exp}`;
  return `${body}.${hmac(body)}`;
}
export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  if (!safeEqual(hmac(body), parts[2])) return null;
  if (Number(parts[1]) < Date.now() / 1000) return null;
  return Buffer.from(parts[0], 'base64url').toString();
}

/** Form render token: proves the form was served by us and lets us reject instant bot submissions. */
export function formRenderToken(formKey: string): string {
  return signToken(`${formKey}:${Date.now()}`, 60 * 60 * 24);
}
export function checkFormRenderToken(token: string | undefined, formKey: string, minMs = 2500): 'ok' | 'invalid' | 'too_fast' {
  const p = verifyToken(token);
  if (!p) return 'invalid';
  const [k, t] = p.split(':');
  if (k !== formKey) return 'invalid';
  return Date.now() - Number(t) < minMs ? 'too_fast' : 'ok';
}

export function unsubscribeToken(email: string): string {
  return hmac(`unsub:${email.toLowerCase()}`);
}

/** One-way, salted IP fingerprint for abuse protection — not reversible to the IP. */
export function ipHash(ip: string): string {
  return hmac(`ip:${ip}`).slice(0, 22);
}

export function clientIp(h: Headers): string {
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'unknown').trim();
}

// ---- Rate limiting (in-memory, per server instance) -------------------------

const buckets = new Map<string, number[]>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const t = Date.now();
  const arr = (buckets.get(key) ?? []).filter((x) => t - x < windowMs);
  if (arr.length >= limit) { buckets.set(key, arr); return false; }
  arr.push(t);
  buckets.set(key, arr);
  if (buckets.size > 10000) for (const [k, v] of buckets) if (!v.some((x) => t - x < windowMs)) buckets.delete(k);
  return true;
}

/** Reject cross-site POSTs. Browsers always send Origin on fetch POSTs. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
