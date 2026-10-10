import { DEFAULT_FORMS, type FormDef, type FormField, type FormKey, type InputType } from './definitions';

const TYPES: InputType[] = ['text', 'email', 'tel', 'url', 'textarea', 'select', 'radio', 'checkboxes'];
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\u0000/g, '').slice(0, max) : '');

/** Validates an edited form definition. Returns errors for anything that would break submissions. */
export function sanitizeFormDef(key: FormKey, input: unknown): { def?: FormDef; errors: string[] } {
  const base = DEFAULT_FORMS[key];
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const errors: string[] = [];
  const rawFields = Array.isArray(src.fields) ? src.fields.slice(0, 40) : [];
  const seen = new Set<string>();
  const fields: FormField[] = [];
  for (const r of rawFields as Record<string, unknown>[]) {
    const fkey = str(r.key, 40);
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fkey)) { errors.push(`Field key “${fkey || '(empty)'}” must start with a letter and use only letters, numbers and underscores.`); continue; }
    if (seen.has(fkey)) { errors.push(`Two fields use the key “${fkey}”.`); continue; }
    seen.add(fkey);
    const locked = base.fields.find((b) => b.key === fkey && b.locked);
    const type = (locked ? locked.type : TYPES.includes(r.type as InputType) ? r.type : 'text') as InputType;
    const options = Array.isArray(r.options) ? r.options.map((o) => str(o, 300).trim()).filter(Boolean).slice(0, 50) : [];
    const label = str(r.label, 300).trim();
    if (!label) errors.push(`Field “${fkey}” needs a label.`);
    if (['select', 'radio', 'checkboxes'].includes(type) && options.length < 2) errors.push(`“${label || fkey}” needs at least two options.`);
    const maxLength = Number(r.maxLength);
    fields.push({
      key: fkey, label, type,
      required: locked ? (fkey === 'name' || fkey === 'email' ? true : r.required === true) : r.required === true,
      enabled: locked ? true : r.enabled !== false,
      ...(locked ? { locked: true } : {}),
      help: str(r.help, 500) || undefined,
      placeholder: str(r.placeholder, 200) || undefined,
      options: options.length ? options : undefined,
      maxLength: Number.isFinite(maxLength) && maxLength > 0 ? Math.min(maxLength, 10000) : undefined,
      autocomplete: str(r.autocomplete, 40) || undefined,
      sheetColumn: str(r.sheetColumn, 200).trim() || undefined,
      inferred: r.inferred === true ? true : undefined,
    });
  }
  for (const b of base.fields) if (b.locked && !seen.has(b.key)) errors.push(`The system field “${b.label}” can’t be removed.`);
  const sheets = (src.sheets && typeof src.sheets === 'object' ? src.sheets : {}) as Record<string, unknown>;
  const notifyTo = str(src.notifyTo, 1000);
  for (const e of notifyTo.split(',').map((x) => x.trim()).filter(Boolean)) if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) errors.push(`“${e}” isn’t a valid notification email.`);
  if (errors.length) return { errors };
  return {
    errors,
    def: {
      ...base,
      title: str(src.title, 200) || base.title,
      submitLabel: str(src.submitLabel, 80) || base.submitLabel,
      successTitle: str(src.successTitle, 200) || base.successTitle,
      successMessage: str(src.successMessage, 2000) || base.successMessage,
      privacyLabel: str(src.privacyLabel, 500) || base.privacyLabel,
      marketingConsent: src.marketingConsent === true,
      notifyTo,
      sendAcknowledgement: src.sendAcknowledgement === true,
      acknowledgementSubject: str(src.acknowledgementSubject, 200),
      acknowledgementBody: str(src.acknowledgementBody, 5000),
      routing: key === 'contact' ? str(src.routing, 3000) : undefined,
      sheets: {
        enabled: sheets.enabled === true,
        sheetName: str(sheets.sheetName, 200),
        timestampColumn: str(sheets.timestampColumn, 200),
        respondentEmailColumn: str(sheets.respondentEmailColumn, 200),
      },
      fields,
    },
  };
}
