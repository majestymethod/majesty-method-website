/** Clean a value that may be a full Typeform link ("https://form.typeform.com/to/AbC123") or just the ID. */
export function typeformId(value: string | undefined | null) {
  const v = (value ?? '').trim();
  const m = v.match(/typeform\.com\/to\/([A-Za-z0-9]+)/);
  return m ? m[1] : /^[A-Za-z0-9]+$/.test(v) ? v : '';
}
