'use client';
import Link from 'next/link';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { api } from './client';

interface Row { id: string; form_key: string; name: string; email: string | null; summary: string; created_at: string; review_status: string; sheets_status: string; email_status: string; notify_status: string; marketing_consent: number }
const FORMS: Record<string, string> = { bootcamp: 'Bootcamp', webinar: 'Webinar', acceleration: 'Acceleration', tenderiq: 'TenderIQ', contact: 'Contact', resource: 'Resource' };
export const fmt = (iso: string) => new Date(iso).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', dateStyle: 'medium', timeStyle: 'short' });
export function SyncPill({ s }: { s: string }) {
  const map: Record<string, [string, string]> = {
    synced: ['pill--ok', 'In sheet'], failed: ['pill--bad', 'Sheet failed'], pending: ['pill--warn', 'Sheet pending'],
    not_configured: ['pill--warn', 'Sheet not set up'], not_applicable: ['', ''],
  };
  const [c, l] = map[s] ?? ['', s];
  return l ? <span className={`pill ${c}`}>{l}</span> : null;
}

export function SubmissionsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const sp = new URLSearchParams({ page: String(page) });
    if (form) sp.set('form', form); if (status) sp.set('status', status); if (q) sp.set('q', q);
    const r = await api<{ items: Row[]; total: number }>(`/api/admin/submissions?${sp}`);
    if (r.ok) { setRows(r.items); setTotal(r.total); }
  }, [form, status, q, page]);
  useEffect(() => { load(); }, [load]);

  async function retry() {
    setMsg('Retrying…');
    const r = await api<{ results: Record<string, number>; configured: boolean }>('/api/admin/submissions/sync', { body: {} });
    setMsg(!r.configured ? 'Google Sheets isn’t set up on the server yet, so nothing could be sent. See the setup guide.' : `Done: ${Object.entries(r.results || {}).map(([k, v]) => `${v} ${k.replace('_', ' ')}`).join(', ') || 'nothing pending'}.`);
    load();
  }
  async function purge() {
    const r = await api<{ count: number; months: number }>('/api/admin/submissions/purge', { body: {} });
    if (!r.ok) return;
    if (r.count === 0) { setMsg(`No submissions are older than ${r.months} months.`); return; }
    if (!confirm(`Permanently delete ${r.count} submission(s) older than ${r.months} months? This can’t be undone.`)) return;
    const d = await api<{ deleted: number }>('/api/admin/submissions/purge', { body: { confirm: true } });
    setMsg(d.ok ? `Deleted ${d.deleted} old submission(s).` : d.message || 'Failed'); load();
  }

  return (
    <>
      <h1>Submissions</h1>
      <p className="adm-sub">Every form submission is stored here first. Mark items as reviewed once someone has followed up.</p>
      <div className="adm-bar">
        <select className="adm-input" style={{ width: 'auto' }} value={form} onChange={(e) => { setForm(e.target.value); setPage(0); }} aria-label="Filter by form">
          <option value="">All forms</option>{Object.entries(FORMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="adm-input" style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Filter by status">
          <option value="">Any status</option><option value="new">New</option><option value="reviewed">Reviewed</option><option value="archived">Archived</option>
        </select>
        <input className="adm-input" style={{ width: 220 }} placeholder="Search name, email…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} aria-label="Search" />
        <span className="spacer" />
        {form ? <a className="adm-btn adm-btn--2 adm-btn--sm" href={`/api/admin/submissions/export?form=${form}`}>Export CSV</a> : <span className="adm-help">Choose a form to export</span>}
        <button className="adm-btn adm-btn--2 adm-btn--sm" type="button" onClick={retry}>Retry Google Sheets</button>
        <button className="adm-btn adm-btn--danger adm-btn--sm" type="button" onClick={purge}>Apply retention</button>
      </div>
      {msg && <p className="adm-msg" role="status">{msg}</p>}
      <table className="adm-table">
        <thead><tr><th>Received</th><th>Form</th><th>Name</th><th>Details</th><th>Status</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5}>No submissions match.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</td>
              <td>{FORMS[r.form_key] ?? r.form_key}</td>
              <td><Link href={`/admin/submissions/${r.id}`}>{r.name || '(no name)'}</Link><div className="adm-help">{r.email}</div></td>
              <td className="adm-help">{r.summary}</td>
              <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <span className={`pill ${r.review_status === 'new' ? 'pill--warn' : 'pill--ok'}`}>{r.review_status}</span>
                <SyncPill s={r.sheets_status} />
                {r.marketing_consent ? <span className="pill">Marketing ✓</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="adm-bar" style={{ borderBottom: 0, marginTop: 12 }}>
        <span className="adm-help">{total} total</span><span className="spacer" />
        <button className="adm-btn adm-btn--2 adm-btn--sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <button className="adm-btn adm-btn--2 adm-btn--sm" disabled={(page + 1) * 50 >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </>
  );
}

export function SubmissionDetail({ id }: { id: string }) {
  const [d, setD] = useState<{ submission: Record<string, unknown> & { data: Record<string, unknown>; context: Record<string, string> }; labels: Record<string, string>; formTitle: string; consents: { wording: string; wording_version: string; granted_at: string; withdrawn_at: string | null }[] } | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api<NonNullable<typeof d>>(`/api/admin/submissions/${id}`).then((r) => r.ok && setD(r)), [id]);
  useEffect(() => { load(); }, [load]);
  if (!d) return <p>Loading…</p>;
  const s = d.submission;
  const setStatus = async (v: string) => { await api(`/api/admin/submissions/${id}`, { method: 'PATCH', body: { review_status: v } }); load(); };
  const remove = async () => {
    if (!confirm('Permanently delete this submission and its consent record? Use this for deletion requests. It can’t be undone. (Copies already in Google Sheets or email must be deleted there too.)')) return;
    const r = await api(`/api/admin/submissions/${id}`, { method: 'DELETE' });
    if (r.ok) window.location.href = '/admin/submissions';
  };
  const resend = async () => {
    setMsg('Working…');
    const r = await api<{ sheets: string; configured: boolean }>('/api/admin/submissions/sync', { body: { id, emails: true } });
    setMsg(`Google Sheets: ${r.sheets?.replace('_', ' ')}. Emails retried where configured.`); load();
  };
  return (
    <>
      <p><a href="/admin/submissions">← Submissions</a></p>
      <h1>{String(s.data.name || s.data.businessName || 'Submission')}</h1>
      <p className="adm-sub">{d.formTitle} · received {fmt(String(s.created_at))}{s.source_page ? ` from ${s.source_page}` : ''}</p>
      <div className="adm-bar">
        <label className="adm-check">Status&nbsp;
          <select className="adm-input" style={{ width: 'auto' }} value={String(s.review_status)} onChange={(e) => setStatus(e.target.value)}>
            <option value="new">New</option><option value="reviewed">Reviewed</option><option value="archived">Archived</option>
          </select>
        </label>
        {s.email ? <a className="adm-btn adm-btn--2 adm-btn--sm" href={`mailto:${s.email}`}>Reply by email</a> : null}
        <button className="adm-btn adm-btn--2 adm-btn--sm" type="button" onClick={resend}>Retry Sheets &amp; emails</button>
        <span className="spacer" />
        <button className="adm-btn adm-btn--danger adm-btn--sm" type="button" onClick={remove}>Delete permanently</button>
      </div>
      {msg && <p className="adm-msg" role="status">{msg}</p>}
      <section className="adm-card">
        <dl className="adm-kv">
          {Object.entries(s.data).map(([k, v]) => (<Fragment key={k}><dt>{d.labels[k] ?? k}</dt><dd>{Array.isArray(v) ? v.join(', ') : String(v || '—')}</dd></Fragment>))}
          {s.context.webinarTitle && <><dt>Webinar</dt><dd>{s.context.webinarTitle}</dd></>}
          {s.context.resourceTitle && <><dt>Resource</dt><dd>{s.context.resourceTitle}</dd></>}
        </dl>
      </section>
      <section className="adm-card">
        <h2>Processing record</h2>
        <dl className="adm-kv">
          <dt>Privacy notice acknowledged</dt><dd>{s.privacy_ack_at ? fmt(String(s.privacy_ack_at)) : 'No'}</dd>
          <dt>Marketing consent</dt><dd>{d.consents.length ? d.consents.map((c) => `Given ${fmt(c.granted_at)} (wording ${c.wording_version})${c.withdrawn_at ? ` — withdrawn ${fmt(c.withdrawn_at)}` : ''}\n“${c.wording}”`).join('\n') : 'Not given'}</dd>
          <dt>Google Sheets</dt><dd><SyncPill s={String(s.sheets_status)} />{s.sheets_status === 'not_applicable' ? 'Not used for this form' : ''} {s.sheets_error ? <span className="adm-help"> {String(s.sheets_error)}</span> : null}</dd>
          <dt>Acknowledgement email</dt><dd>{String(s.email_status).replace('_', ' ')}</dd>
          <dt>Team notification</dt><dd>{String(s.notify_status).replace('_', ' ')}</dd>
          <dt>Submission ID</dt><dd className="adm-help">{String(s.id)}</dd>
        </dl>
      </section>
    </>
  );
}
