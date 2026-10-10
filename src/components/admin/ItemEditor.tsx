'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COLLECTION_MAP } from '@/lib/content/schema';
import { SchemaEditor } from './SchemaEditor';
import { api } from './client';

export function ItemEditor({ collection, id }: { collection: string; id: string }) {
  const def = COLLECTION_MAP[collection];
  const router = useRouter();
  const isNew = id === 'new';
  const [data, setData] = useState<Record<string, unknown> | null>(isNew ? { ...def.blank } : null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [sort, setSort] = useState(0);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api<{ item: { data: Record<string, unknown>; status: 'draft' | 'published'; sort: number } }>(`/api/admin/item/${id}`).then((r) => {
      if (r.ok) { setData({ ...def.blank, ...r.item.data }); setStatus(r.item.status); setSort(r.item.sort); } else setMsg({ t: 'err', m: r.message || 'Not found' });
    });
  }, [id, isNew, def]);

  async function save(nextStatus: 'draft' | 'published') {
    setBusy(true); setMsg(null);
    const r = await api<{ id: string }>(isNew ? `/api/admin/items/${collection}` : `/api/admin/item/${id}`, { method: isNew ? 'POST' : 'PUT', body: { data, status: nextStatus, sort } });
    setBusy(false);
    if (!r.ok) { setMsg({ t: 'err', m: r.message || 'Save failed.' }); return; }
    setStatus(nextStatus); setDirty(false);
    if (isNew) { router.replace(`/admin/collections/${collection}/${r.id}`); return; }
    setMsg({ t: 'ok', m: nextStatus === 'published' ? 'Saved and published. It’s now live.' : 'Saved as a draft. Not visible to visitors.' });
  }
  async function remove() {
    if (!confirm(`Delete this ${def.singular} permanently?`)) return;
    const r = await api(`/api/admin/item/${id}`, { method: 'DELETE' });
    if (r.ok) router.push(`/admin/collections/${collection}`); else setMsg({ t: 'err', m: r.message || 'Delete failed.' });
  }

  if (!def) return <p>Unknown collection.</p>;
  const title = String(data?.[def.itemLabelKey] || '');
  return (
    <>
      <p><a href={`/admin/collections/${collection}`}>← {def.title}</a></p>
      <h1>{isNew ? `New ${def.singular}` : title || `Edit ${def.singular}`}</h1>
      <div className="adm-bar">
        <button className="adm-btn adm-btn--2" type="button" disabled={busy} onClick={() => save('draft')}>{status === 'published' && !isNew ? 'Unpublish (save as draft)' : 'Save draft'}</button>
        <button className="adm-btn" type="button" disabled={busy} onClick={() => save('published')}>{status === 'published' && !isNew ? 'Save and keep published' : 'Publish'}</button>
        <span className="spacer" />
        {dirty && <span className="pill pill--warn">Unsaved changes</span>}
        <span className={`pill ${status === 'published' ? 'pill--ok' : 'pill--draft'}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
        {!isNew && <button className="adm-btn adm-btn--danger adm-btn--sm" type="button" onClick={remove}>Delete</button>}
      </div>
      {msg && <p className={`adm-msg${msg.t === 'err' ? ' adm-msg--err' : ''}`} role="status">{msg.m}</p>}
      {/\[EXAMPLE/.test(title) && <p className="adm-msg adm-msg--warn">This is an example item. Replace its content before publishing, or delete it.</p>}
      {data ? (
        <>
          <SchemaEditor fields={def.fields} value={data} onChange={(v) => { setData(v); setDirty(true); }} />
          <div className="adm-field">
            <label htmlFor="sort">Sort order</label>
            <span className="adm-help">Lower numbers appear first.</span>
            <input id="sort" type="number" value={sort} onChange={(e) => { setSort(Number(e.target.value)); setDirty(true); }} style={{ maxWidth: 140 }} />
          </div>
        </>
      ) : <p>Loading…</p>}
    </>
  );
}
