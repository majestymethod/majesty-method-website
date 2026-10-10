import type { FieldDef } from './schema';

const LIMITS: Partial<Record<FieldDef['type'], number>> = { text: 500, textarea: 5000, lines: 10000, markdown: 60000, url: 1000, email: 254 };

export function safeHref(v: string): string {
  const s = v.trim();
  if (!s) return '';
  if (/^(https?:|mailto:|tel:)/i.test(s) || s.startsWith('/') || s.startsWith('#')) return s.slice(0, 1000);
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return `https://${s}`; // bare domain
  return ''; // drops javascript:, data:, etc.
}

/** Coerces untrusted editor input to the shape the schema describes. Unknown keys are dropped. */
export function sanitizeBySchema(fields: FieldDef[], input: unknown): Record<string, unknown> {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = sanitizeField(f, src[f.key]);
  return out;
}

function sanitizeField(f: FieldDef, v: unknown): unknown {
  switch (f.type) {
    case 'group':
      return sanitizeBySchema(f.fields ?? [], v);
    case 'list':
      return Array.isArray(v) ? v.slice(0, 100).map((item) => sanitizeBySchema(f.fields ?? [], item)) : [];
    case 'boolean':
      return v === true;
    case 'number': {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(n, 100000)) : 0;
    }
    case 'image':
    case 'file': {
      if (!v || typeof v !== 'object') return null;
      const o = v as Record<string, unknown>;
      if (typeof o.id !== 'string' || !/^[\w-]{1,64}$/.test(o.id)) return null;
      return f.type === 'image'
        ? { id: o.id, alt: typeof o.alt === 'string' ? o.alt.slice(0, 300) : '' }
        : { id: o.id, name: typeof o.name === 'string' ? o.name.slice(0, 200) : '' };
    }
    case 'select': {
      const s = typeof v === 'string' ? v : '';
      return f.options?.includes(s) ? s : f.options?.[0] ?? '';
    }
    case 'datetime': {
      const s = typeof v === 'string' ? v.trim() : '';
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s) ? s : '';
    }
    case 'url':
      return safeHref(typeof v === 'string' ? v : '');
    default: {
      let s = typeof v === 'string' ? v.replace(/\u0000/g, '') : v == null ? '' : String(v);
      s = s.slice(0, LIMITS[f.type] ?? 2000);
      if (f.key === 'href' || /Url$/.test(f.key)) s = safeHref(s);
      return s;
    }
  }
}
