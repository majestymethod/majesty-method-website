import { requireUser, ok, readJson } from '@/lib/api';
import { retryPendingSheets, syncSubmission, sheetsConfigured } from '@/lib/integrations/sheets';
import { sendNotifications } from '@/lib/forms/submit';

export async function POST(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const body = await readJson<{ id?: string; emails?: boolean }>(req, 1000);
  if (body?.id) {
    const sheets = await syncSubmission(body.id);
    if (body.emails) await sendNotifications(body.id);
    return ok({ sheets, configured: sheetsConfigured() });
  }
  return ok({ results: await retryPendingSheets(), configured: sheetsConfigured() });
}
