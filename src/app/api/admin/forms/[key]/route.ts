import { getForm, saveForm } from '@/lib/content/store';
import { DEFAULT_FORMS, type FormKey } from '@/lib/forms/definitions';
import { sanitizeFormDef } from '@/lib/forms/sanitize-def';
import { requireUser, fail, ok, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ key: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const { key } = await params;
  if (!(key in DEFAULT_FORMS)) return fail(404, 'Not found');
  return ok({ form: getForm(key as FormKey), defaults: DEFAULT_FORMS[key as FormKey] });
}

export async function PUT(req: Request, { params }: Ctx) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const { key } = await params;
  if (!(key in DEFAULT_FORMS)) return fail(404, 'Not found');
  const body = await readJson<{ form: unknown }>(req);
  const { def, errors } = sanitizeFormDef(key as FormKey, body?.form);
  if (!def) return fail(422, errors.join(' '), { errors });
  saveForm(key as FormKey, def, u.id);
  return ok({ form: getForm(key as FormKey) });
}
