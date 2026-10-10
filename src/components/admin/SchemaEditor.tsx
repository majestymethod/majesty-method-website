'use client';
import { useEffect, useRef, useState } from 'react';
import type { FieldDef } from '@/lib/content/schema';
import { api } from './client';

type Obj = Record<string, unknown>;

export function SchemaEditor({ fields, value, onChange, idPrefix = 'f' }: { fields: FieldDef[]; value: Obj; onChange: (v: Obj) => void; idPrefix?: string }) {
  return (
    <>
      {fields.map((f) => (
        <FieldControl key={f.key} f={f} id={`${idPrefix}-${f.key}`} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
      ))}
    </>
  );
}

function Help({ f }: { f: FieldDef }) {
  return f.help ? <span className="adm-help">{f.help}</span> : null;
}

function FieldControl({ f, id, value, onChange }: { f: FieldDef; id: string; value: unknown; onChange: (v: unknown) => void }) {
  const s = typeof value === 'string' ? value : '';
  switch (f.type) {
    case 'group':
      return (
        <fieldset className="adm-group">
          <legend>{f.label}</legend>
          {f.help && <p className="adm-help" style={{ marginBottom: 10 }}>{f.help}</p>}
          <SchemaEditor fields={f.fields ?? []} value={(value as Obj) ?? {}} onChange={onChange} idPrefix={id} />
        </fieldset>
      );
    case 'list':
      return <ListControl f={f} id={id} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />;
    case 'boolean':
      return (
        <div className="adm-field">
          <label className="adm-check" htmlFor={id}><input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} /> {f.label}</label>
          <Help f={f} />
        </div>
      );
    case 'image':
      return <ImageControl f={f} id={id} value={value as { id: string; alt?: string } | null} onChange={onChange} />;
    case 'file':
      return <FileControl f={f} id={id} value={value as { id: string; name?: string } | null} onChange={onChange} />;
    case 'select':
      return (
        <div className="adm-field">
          <label htmlFor={id}>{f.label}</label><Help f={f} />
          <select id={id} value={s} onChange={(e) => onChange(e.target.value)}>
            {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    case 'textarea': case 'lines': case 'markdown':
      return (
        <div className="adm-field">
          <label htmlFor={id}>{f.label}</label><Help f={f} />
          <textarea id={id} className={f.type === 'markdown' ? 'mono' : undefined} rows={f.type === 'lines' ? Math.max(4, s.split('\n').length + 1) : 3}
            value={s} onChange={(e) => onChange(e.target.value)} />
          {f.type === 'markdown' && <span className="adm-help">Markdown: ## Heading, **bold**, - list item, [link text](https://…). Tables use | pipes |.</span>}
        </div>
      );
    case 'number':
      return (
        <div className="adm-field">
          <label htmlFor={id}>{f.label}</label><Help f={f} />
          <input id={id} type="number" min={0} value={typeof value === 'number' ? value : Number(value) || 0} onChange={(e) => onChange(Number(e.target.value))} style={{ maxWidth: 200 }} />
        </div>
      );
    case 'datetime':
      return (
        <div className="adm-field">
          <label htmlFor={id}>{f.label}</label><Help f={f} />
          <input id={id} type="datetime-local" value={s} onChange={(e) => onChange(e.target.value)} style={{ maxWidth: 280 }} />
        </div>
      );
    default:
      return (
        <div className="adm-field">
          <label htmlFor={id}>{f.label}{f.required ? ' (required)' : ''}</label><Help f={f} />
          <input id={id} type={f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : 'text'} value={s} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}

function blankFor(fields: FieldDef[]): Obj {
  const o: Obj = {};
  for (const f of fields) o[f.key] = f.type === 'list' ? [] : f.type === 'group' ? blankFor(f.fields ?? []) : f.type === 'boolean' ? false : f.type === 'image' || f.type === 'file' ? null : '';
  return o;
}

function ListControl({ f, id, value, onChange }: { f: FieldDef; id: string; value: Obj[]; onChange: (v: unknown) => void }) {
  const move = (i: number, d: number) => {
    const n = [...value]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };
  return (
    <div className="adm-list">
      <span className="adm-label">{f.label}</span>
      <Help f={f} />
      {value.map((item, i) => (
        <details className="adm-item" key={i} open={value.length <= 2 || !item[f.itemLabelKey ?? ''] }>
          <summary>
            <span>{String(item[f.itemLabelKey ?? ''] || `Item ${i + 1}`)}</span>
            <span className="spacer" />
            <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={(e) => { e.preventDefault(); move(i, -1); }} disabled={i === 0} aria-label={`Move item ${i + 1} up`}>↑</button>
            <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={(e) => { e.preventDefault(); move(i, 1); }} disabled={i === value.length - 1} aria-label={`Move item ${i + 1} down`}>↓</button>
            <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={(e) => { e.preventDefault(); if (confirm('Remove this item?')) onChange(value.filter((_, j) => j !== i)); }}>Remove</button>
          </summary>
          <div>
            <SchemaEditor fields={f.fields ?? []} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} idPrefix={`${id}-${i}`} />
          </div>
        </details>
      ))}
      <div><button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={() => onChange([...value, blankFor(f.fields ?? [])])}>Add {f.label.toLowerCase().replace(/s$/, '')}</button></div>
    </div>
  );
}

interface Media { id: string; original_name: string; alt: string; variants: { w: number; file: string }[]; mime: string }
export const thumb = (m: Media | undefined) => (m ? `/media/${(m.variants.find((v) => v.w >= 320) ?? m.variants[0])?.file}` : '');

function ImageControl({ f, id, value, onChange }: { f: FieldDef; id: string; value: { id: string; alt?: string } | null; onChange: (v: unknown) => void }) {
  const [media, setMedia] = useState<Media[]>([]);
  const dlg = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = () => api<{ items: Media[] }>('/api/admin/media').then((r) => r.ok && setMedia(r.items));
  useEffect(() => { load(); }, []);
  const current = media.find((m) => m.id === value?.id);
  async function upload(file: File) {
    setBusy(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    const r = await api<{ media: Media }>('/api/admin/media', { form: fd });
    setBusy(false);
    if (!r.ok) { setErr(r.message || 'Upload failed'); return; }
    await load();
    onChange({ id: r.media.id, alt: value?.alt ?? '' });
    dlg.current?.close();
  }
  return (
    <div className="adm-field">
      <span className="adm-label">{f.label}</span><Help f={f} />
      <div className="adm-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {current ? <img src={thumb(current)} alt="" /> : <span className="adm-help">No image selected</span>}
        <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={() => { load(); dlg.current?.showModal(); }}>{current ? 'Change image' : 'Choose image'}</button>
        {value && <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => onChange(null)}>Remove</button>}
      </div>
      {value && (
        <div className="adm-field" style={{ marginTop: 8 }}>
          <label htmlFor={`${id}-alt`}>Alternative text</label>
          <span className="adm-help">Describe the image for people using screen readers. Leave empty if it’s purely decorative.</span>
          <input id={`${id}-alt`} type="text" value={value.alt ?? ''} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
        </div>
      )}
      <dialog ref={dlg} className="adm-dialog" aria-label="Choose an image">
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <h2 style={{ flex: 1 }}>Choose an image</h2>
            <label className="adm-btn adm-btn--sm">{busy ? 'Uploading…' : 'Upload new'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={() => dlg.current?.close()}>Close</button>
          </div>
          {err && <p className="adm-msg adm-msg--err">{err}</p>}
          <div className="adm-media-grid">
            {media.map((m) => (
              <figure key={m.id}>
                <button type="button" className="pick" onClick={() => { onChange({ id: m.id, alt: value?.alt || m.alt || '' }); dlg.current?.close(); }} aria-label={`Use ${m.original_name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(m)} alt="" />
                </button>
                <figcaption className="adm-help">{m.original_name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  );
}

function FileControl({ f, id, value, onChange }: { f: FieldDef; id: string; value: { id: string; name?: string } | null; onChange: (v: unknown) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function upload(file: File) {
    setBusy(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    const r = await api<{ file: { id: string; name: string } }>('/api/admin/files', { form: fd });
    setBusy(false);
    if (!r.ok) { setErr(r.message || 'Upload failed'); return; }
    onChange({ id: r.file.id, name: r.file.name });
  }
  return (
    <div className="adm-field">
      <span className="adm-label">{f.label}</span><Help f={f} />
      <div className="adm-img">
        <span>{value ? <strong>{value.name || 'Uploaded file'}</strong> : <span className="adm-help">No file uploaded</span>}</span>
        <label className="adm-btn adm-btn--2 adm-btn--sm" htmlFor={id}>{busy ? 'Uploading…' : value ? 'Replace file' : 'Upload file'}</label>
        <input id={id} type="file" hidden accept=".pdf,.docx,.xlsx,.pptx,.zip,.png,.jpg,.jpeg,.csv,.txt" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {value && <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => onChange(null)}>Remove</button>}
      </div>
      {err && <p className="adm-msg adm-msg--err">{err}</p>}
    </div>
  );
}
