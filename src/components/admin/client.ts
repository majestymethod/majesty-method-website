'use client';
export async function api<T = Record<string, unknown>>(url: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T & { ok: boolean; message?: string }> {
  const res = await fetch(url, {
    method: opts.method || (opts.body || opts.form ? 'POST' : 'GET'),
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.form ?? (opts.body ? JSON.stringify(opts.body) : undefined),
    cache: 'no-store',
  });
  if (res.status === 401 && typeof window !== 'undefined') { window.location.href = '/admin/login'; }
  const data = await res.json().catch(() => ({ ok: false, message: `Request failed (HTTP ${res.status}).` }));
  return data;
}
