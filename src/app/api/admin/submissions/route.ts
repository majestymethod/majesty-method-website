import { db } from '@/lib/db';
import { requireUser, ok } from '@/lib/api';

export async function GET(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const sp = new URL(req.url).searchParams;
  const where: string[] = [];
  const args: unknown[] = [];
  if (sp.get('form')) { where.push('form_key = ?'); args.push(sp.get('form')); }
  if (sp.get('status')) { where.push('review_status = ?'); args.push(sp.get('status')); }
  if (sp.get('sheets')) { where.push('sheets_status = ?'); args.push(sp.get('sheets')); }
  if (sp.get('q')) { where.push('(email LIKE ? OR data LIKE ?)'); args.push(`%${sp.get('q')}%`, `%${sp.get('q')}%`); }
  const page = Math.max(0, Number(sp.get('page')) || 0);
  const sql = `SELECT id, form_key, data, email, context, created_at, review_status, sheets_status, email_status, notify_status, marketing_consent
               FROM submissions ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 50 OFFSET ?`;
  const rows = db().prepare(sql).all(...args, page * 50) as { data: string; context: string | null }[];
  const total = (db().prepare(`SELECT COUNT(*) n FROM submissions ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`).get(...args) as { n: number }).n;
  return ok({
    total, page,
    items: rows.map((r) => {
      const d = JSON.parse(r.data); const c = r.context ? JSON.parse(r.context) : {};
      return { ...r, data: undefined, context: undefined, name: d.name || d.businessName || '', summary: c.webinarTitle || c.resourceTitle || d.enquiryType || d.businessName || d.business || '' };
    }),
  });
}
