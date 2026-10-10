import { db, audit } from '@/lib/db';
import { getSettings } from '@/lib/content/store';
import { requireUser, ok, readJson, fail } from '@/lib/api';

/** Deletes submissions older than the retention period set in Settings. */
export async function POST(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const body = await readJson<{ confirm?: boolean }>(req, 500);
  const months = Number(getSettings().retentionMonths) || 24;
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - months);
  const count = (db().prepare('SELECT COUNT(*) n FROM submissions WHERE created_at < ?').get(cutoff.toISOString()) as { n: number }).n;
  if (!body?.confirm) return ok({ count, cutoff: cutoff.toISOString(), months });
  if (count === 0) return fail(400, 'Nothing to delete.');
  db().transaction(() => {
    db().prepare('DELETE FROM marketing_consents WHERE submission_id IN (SELECT id FROM submissions WHERE created_at < ?) AND withdrawn_at IS NOT NULL').run(cutoff.toISOString());
    db().prepare('DELETE FROM submissions WHERE created_at < ?').run(cutoff.toISOString());
  })();
  audit(u.id, 'submission.purge', `${count} before ${cutoff.toISOString()}`);
  return ok({ deleted: count });
}
