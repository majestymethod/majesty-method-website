import type { FormDef, FormField } from './definitions';

export type Values = Record<string, string | string[]>;
export type Errors = Record<string, string>;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const TEL = /^\+?[\d\s()-]{7,20}$/;

export function activeFields(def: FormDef): FormField[] {
  return def.fields.filter((f) => f.enabled);
}

/** Shared by browser (instant feedback) and server (authoritative). */
export function validateValues(def: FormDef, input: Record<string, unknown>): { values: Values; errors: Errors } {
  const values: Values = {};
  const errors: Errors = {};
  for (const f of activeFields(def)) {
    const raw = input[f.key];
    const max = f.maxLength ?? (f.type === 'textarea' ? 4000 : 300);
    if (f.type === 'checkboxes') {
      const arr = Array.isArray(raw) ? raw.map(String) : [];
      const valid = arr.filter((v) => f.options?.includes(v));
      if (f.required && valid.length === 0) errors[f.key] = 'Choose at least one option.';
      values[f.key] = valid;
      continue;
    }
    const v = typeof raw === 'string' ? raw.replace(/\u0000/g, '').trim() : '';
    values[f.key] = v;
    if (!v) {
      if (f.required) errors[f.key] = f.type === 'select' || f.type === 'radio' ? 'Choose an option.' : 'This field is required.';
      continue;
    }
    if (v.length > max) { errors[f.key] = `Keep this under ${max} characters.`; continue; }
    if (f.type === 'email' && !EMAIL.test(v)) errors[f.key] = 'Enter a valid email address, like name@example.com.';
    if (f.type === 'tel' && !TEL.test(v)) errors[f.key] = 'Enter a valid phone number, like 081 234 5678.';
    if (f.type === 'url') {
      const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      try { const u = new URL(withScheme); if (!u.hostname.includes('.')) throw 0; values[f.key] = withScheme; }
      catch { errors[f.key] = 'Enter a valid web address, like www.example.co.za.'; }
    }
    if ((f.type === 'select' || f.type === 'radio') && !f.options?.includes(v)) errors[f.key] = 'Choose one of the listed options.';
  }
  return { values, errors };
}
