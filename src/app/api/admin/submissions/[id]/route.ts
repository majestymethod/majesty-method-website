import { db, audit } from '@/lib/db';
import { getForm } from '@/lib/content/store';
import type { FormKey } from '@/lib/forms/definitions';
import { requireUser, fail, ok, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const { id } = await params;
  const row = db().prepare('SELECT * FROM submissions WHERE id = ?').get(id) as Record<string, unknown> & { data: string; context: string | null; form_key: FormKey } | undefined;
  if (!row) return fail(404, 'Not found');
  const def = getForm(row.form_key);
  const consents = db().prepare('SELECT * FROM marketing_consents WHERE submission_id = ?').all(id);
  audit(u.id, 'submission.view', id);
  return ok({ submission: { ...row, data: JSON.parse(row.data), context: row.context ? JSON.parse(row.context) : {} }, labels: Object.fromEntries(def.fields.map((f) => [f.key, f.label])), formTitle: def.title, consents });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const { id } = await params;
  const body = await readJson<{ review_status: string }>(req, 1000);
  if (!body || !['new', 'reviewed', 'archived'].includes(body.review_status)) return fail(400, 'Invalid status');
  db().prepare('UPDATE submissions SET review_status = ? WHERE id = ?').run(body.review_status, id);
  return ok();
}

/** Permanent deletion, e.g. for a data subject's deletion request. */
export async function DELETE(req: Request, { params }: Ctx) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const { id } = await params;
  db().transaction(() => {
    db().prepare('DELETE FROM marketing_consents WHERE submission_id = ?').run(id);
    db().prepare('DELETE FROM submissions WHERE id = ?').run(id);
  })();
  audit(u.id, 'submission.delete', id);
  return ok();
}
