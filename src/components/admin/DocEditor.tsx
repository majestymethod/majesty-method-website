'use client';
import { useCallback, useEffect, useState } from 'react';
import { DOC_MAP } from '@/lib/content/schema';
import { SchemaEditor } from './SchemaEditor';
import { api } from './client';

type Meta = { hasUnpublished: boolean; updated_at: string; published_at: string | null };

export function DocEditor({ docKey }: { docKey: string }) {
  const def = DOC_MAP[docKey];
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const isSettings = docKey === 'settings';

  const load = useCallback(async () => {
    const r = await api<{ data: Record<string, unknown>; meta: Meta }>(`/api/admin/content/${docKey}`);
    if (r.ok) { setData(r.data); setMeta(r.meta); setDirty(false); } else setMsg({ t: 'err', m: r.message || 'Could not load.' });
  }, [docKey]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  async function save(): Promise<boolean> {
    setBusy(true);
    const r = await api<{ meta: Meta }>(`/api/admin/content/${docKey}`, { method: 'PUT', body: { data } });
    setBusy(false);
    if (!r.ok) { setMsg({ t: 'err', m: r.message || 'Save failed.' }); return false; }
    setMeta(r.meta); setDirty(false);
    return true;
  }
  async function action(a: 'publish' | 'discard' | 'reset') {
    if (a === 'publish' && dirty && !(await save())) return;
    if (a === 'discard' && !confirm('Discard all unpublished changes to this page?')) return;
    if (a === 'reset' && !confirm('Replace this page’s draft with the original default content? You can still discard before publishing.')) return;
    setBusy(true);
    const r = await api<{ data: Record<string, unknown>; meta: Meta }>(`/api/admin/content/${docKey}`, { body: { action: a } });
    setBusy(false);
    if (!r.ok) { setMsg({ t: 'err', m: r.message || 'Action failed.' }); return; }
    setData(r.data); setMeta(r.meta); setDirty(false);
    setMsg({ t: 'ok', m: a === 'publish' ? 'Published. The live page now shows these changes.' : a === 'discard' ? 'Unpublished changes discarded.' : 'Draft reset to default content. Publish to make it live.' });
  }
  async function preview() {
    if (dirty && !(await save())) return;
    window.open(`/api/admin/preview?to=${encodeURIComponent(def.route || '/')}`, '_blank', 'noopener');
  }

  if (!def) return <p>Unknown page.</p>;
  return (
    <>
      <h1>{def.title}</h1>
      <p className="adm-sub">
        {isSettings ? 'Changes here apply across the whole site as soon as you save.' : 'Save your changes as a draft, preview them, then publish. Visitors only see published content.'}
        {def.route && <> Live page: <a href={def.route} target="_blank" rel="noopener">{def.route}</a></>}
      </p>
      <div className="adm-bar">
        {isSettings ? (
          <button className="adm-btn" type="button" onClick={async () => { if (await save()) setMsg({ t: 'ok', m: 'Saved. Changes are live.' }); }} disabled={busy || !dirty}>Save</button>
        ) : (<>
          <button className="adm-btn adm-btn--2" type="button" onClick={async () => { if (await save()) setMsg({ t: 'ok', m: 'Draft saved. Not yet live.' }); }} disabled={busy || !dirty}>Save draft</button>
          {def.route && <button className="adm-btn adm-btn--2" type="button" onClick={preview} disabled={busy}>Preview</button>}
          <button className="adm-btn" type="button" onClick={() => action('publish')} disabled={busy || (!dirty && !meta?.hasUnpublished)}>Publish</button>
        </>)}
        <span className="spacer" />
        {dirty ? <span className="pill pill--warn">Unsaved changes</span> : !isSettings && meta?.hasUnpublished ? <span className="pill pill--draft">Draft not published</span> : <span className="pill pill--ok">{isSettings ? 'Saved' : 'Published'}</span>}
        {!isSettings && meta?.hasUnpublished && <button className="adm-btn adm-btn--danger adm-btn--sm" type="button" onClick={() => action('discard')} disabled={busy}>Discard draft</button>}
        {!isSettings && <button className="adm-btn adm-btn--2 adm-btn--sm" type="button" onClick={() => action('reset')} disabled={busy}>Reset to default</button>}
      </div>
      {msg && <p className={`adm-msg${msg.t === 'err' ? ' adm-msg--err' : ''}`} role="status">{msg.m}</p>}
      {data ? <SchemaEditor fields={def.fields} value={data} onChange={(v) => { setData(v); setDirty(true); setMsg(null); }} /> : <p>Loading…</p>}
    </>
  );
}
