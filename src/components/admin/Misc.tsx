'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from './client';
import { thumb } from './SchemaEditor';
import { fmt } from './Submissions';

// ---------------------------------------------------------------- Dashboard
interface Status {
  user: { name: string; role: string };
  integrations: Record<string, boolean | string | null>;
  counts: { form_key: string; total: number; unread: number }[];
  sheetsIssues: number;
  inferred: { form: string; label: string }[];
  placeholders: { doc: string; title: string; text: string }[];
  unpublished: string[];
}
const Check = ({ on, label, help }: { on: boolean; label: string; help: string }) => (
  <tr><td>{label}</td><td>{on ? <span className="pill pill--ok">Configured</span> : <span className="pill pill--warn">Not configured</span>}</td><td className="adm-help">{help}</td></tr>
);

export function Dashboard() {
  const [s, setS] = useState<Status | null>(null);
  useEffect(() => { api<Status>('/api/admin/status').then((r) => r.ok && setS(r)); }, []);
  if (!s) return <p>Loading…</p>;
  const owner = s.user.role === 'owner';
  const unread = s.counts.reduce((n, c) => n + (c.unread || 0), 0);
  const i = s.integrations;
  return (
    <>
      <h1>Welcome, {s.user.name.split(' ')[0]}</h1>
      <p className="adm-sub">Edit pages, manage webinars, courses and resources, and follow up on enquiries.</p>
      <div className="adm-grid" style={{ marginBottom: 20 }}>
        {owner && <Link href="/admin/submissions?status=new" className="adm-card" style={{ textDecoration: 'none', color: 'inherit' }}><h2>{unread}</h2><p className="adm-help">New submissions to review</p></Link>}
        <Link href="/admin/content" className="adm-card" style={{ textDecoration: 'none', color: 'inherit' }}><h2>{s.unpublished.length}</h2><p className="adm-help">Pages with unpublished changes</p></Link>
        <Link href="/admin/collections/webinars" className="adm-card" style={{ textDecoration: 'none', color: 'inherit' }}><h2>Webinars</h2><p className="adm-help">Add or update Friday sessions</p></Link>
      </div>

      {owner && (<>
        <section className="adm-card">
          <h2>Before launch</h2>
          <table className="adm-table">
            <tbody>
              <Check on={!!i.appSecret} label="Security secret (APP_SECRET)" help="Required in production. Signs download links, unsubscribe links and form tokens." />
              <Check on={!!i.siteUrl} label="Website address (SITE_URL)" help="Used for search engines, sharing previews and links in emails." />
              <Check on={!!i.sheets} label="Google Sheets" help="Copies Bootcamp registrations to your response sheet. Submissions are still saved here without it." />
              <Check on={!!i.email} label="Email delivery (SMTP)" help="Sends acknowledgements and team notifications. Without it, check this inbox for new submissions." />
              <Check on={!!i.booking} label="Discovery call booking link" help="Optional. Set in Business details." />
              <Check on={!!i.analytics} label="Analytics" help="Optional. Only loads after visitors accept analytics cookies." />
            </tbody>
          </table>
          {s.sheetsIssues > 0 && <p className="adm-msg adm-msg--warn" style={{ marginTop: 12 }}>{s.sheetsIssues} submission(s) haven’t reached Google Sheets yet. <Link href="/admin/submissions">Retry from Submissions</Link>.</p>}
        </section>

        <section className="adm-card">
          <h2>Placeholders still published ({s.placeholders.length})</h2>
          <p className="adm-help" style={{ marginBottom: 12 }}>Replace these with real details (or have them reviewed) before launch. Business details are filled in once under Business details and appear on the legal pages automatically.</p>
          {s.placeholders.length === 0 ? <p className="adm-msg">None found.</p> : (
            <table className="adm-table"><tbody>
              {s.placeholders.map((p, k) => (
                <tr key={k}><td><Link href={p.doc.startsWith('legal') || ['settings', 'bootcamp', 'entry', 'mm_home', 'tenderiq', 'acceleration'].includes(p.doc) ? `/admin/content/${p.doc}` : `/admin/collections/${p.doc}`}>{p.title}</Link></td><td><code>{p.text}</code></td></tr>
              ))}
            </tbody></table>
          )}
        </section>

        {s.inferred.length > 0 && (
          <section className="adm-card">
            <h2>Form options to confirm</h2>
            <p className="adm-help" style={{ marginBottom: 12 }}>These answer options were inferred from responses to your existing Google Form, because the form itself couldn’t be exported. Check them against the original.</p>
            <ul style={{ paddingLeft: 20 }}>{s.inferred.map((x) => <li key={x.form + x.label}><Link href={`/admin/forms/${x.form}`}>{x.label}</Link></li>)}</ul>
          </section>
        )}
      </>)}
    </>
  );
}

// ---------------------------------------------------------------- Consents
export function Consents() {
  const [items, setItems] = useState<{ email: string; form_key: string; wording_version: string; granted_at: string; withdrawn_at: string | null; unsubscribeUrl: string }[]>([]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api<{ items: typeof items }>('/api/admin/consents').then((r) => r.ok && setItems(r.items)), []);
  useEffect(() => { load(); }, [load]);
  async function withdraw(e: React.FormEvent) {
    e.preventDefault();
    const r = await api<{ updated: number }>('/api/admin/consents', { body: { email } });
    setMsg(r.ok ? `Marketing consent withdrawn for ${email} (${r.updated} record(s)).` : r.message || 'Failed'); setEmail(''); load();
  }
  return (
    <>
      <h1>Marketing consent</h1>
      <p className="adm-sub">Who has agreed to receive marketing emails, with the wording they agreed to and when. Only email people who are active here, and include their personal unsubscribe link (it’s in the export).</p>
      <div className="adm-bar">
        <a className="adm-btn" href="/api/admin/consents?format=csv">Export active subscribers (CSV)</a>
        <span className="spacer" />
        <form onSubmit={withdraw} style={{ display: 'flex', gap: 8 }}>
          <label className="visually-hidden" htmlFor="wd">Email to unsubscribe</label>
          <input id="wd" className="adm-input" style={{ width: 240 }} type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="adm-btn adm-btn--2" type="submit">Record unsubscribe</button>
        </form>
      </div>
      {msg && <p className="adm-msg" role="status">{msg}</p>}
      <table className="adm-table">
        <thead><tr><th>Email</th><th>From form</th><th>Given</th><th>Wording</th><th>Status</th></tr></thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan={5}>No consent records yet.</td></tr>}
          {items.map((c, i) => (
            <tr key={i}><td>{c.email}</td><td>{c.form_key}</td><td>{fmt(c.granted_at)}</td><td>{c.wording_version}</td>
              <td>{c.withdrawn_at ? <span className="pill">Withdrawn {fmt(c.withdrawn_at)}</span> : <span className="pill pill--ok">Active</span>}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ---------------------------------------------------------------- Media
interface Media { id: string; original_name: string; alt: string; variants: { w: number; file: string }[]; mime: string; width: number | null; height: number | null }
export function MediaLibrary() {
  const [items, setItems] = useState<Media[]>([]);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api<{ items: Media[] }>('/api/admin/media').then((r) => r.ok && setItems(r.items)), []);
  useEffect(() => { load(); }, [load]);
  async function upload(files: FileList) {
    setBusy(true);
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.append('file', f);
      const r = await api('/api/admin/media', { form: fd });
      if (!r.ok) setMsg({ t: 'err', m: `${f.name}: ${r.message}` });
    }
    setBusy(false); load();
  }
  return (
    <>
      <h1>Images</h1>
      <p className="adm-sub">Upload images here or directly from any image field. Images are resized automatically for fast loading. To replace the logo or hero image, open Business details or the page, then choose the new image.</p>
      <div className="adm-bar">
        <label className="adm-btn">{busy ? 'Uploading…' : 'Upload images'}<input type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" onChange={(e) => e.target.files && upload(e.target.files)} /></label>
      </div>
      {msg && <p className={`adm-msg${msg.t === 'err' ? ' adm-msg--err' : ''}`}>{msg.m}</p>}
      <div className="adm-media-grid">
        {items.map((m) => (
          <figure key={m.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(m)} alt="" />
            <figcaption className="adm-help">{m.original_name}{m.width ? ` · ${m.width}×${m.height}` : ''}</figcaption>
            <label className="adm-help" htmlFor={`alt-${m.id}`}>Default alt text</label>
            <input id={`alt-${m.id}`} className="adm-input" defaultValue={m.alt} onBlur={(e) => api(`/api/admin/media/${m.id}`, { method: 'PATCH', body: { alt: e.target.value } })} />
            <button className="adm-btn adm-btn--danger adm-btn--sm" type="button" onClick={async () => {
              if (!confirm('Delete this image?')) return;
              const r = await api(`/api/admin/media/${m.id}`, { method: 'DELETE' });
              if (!r.ok) setMsg({ t: 'err', m: r.message || 'Delete failed' }); else load();
            }}>Delete</button>
          </figure>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Users
export function Users() {
  const [items, setItems] = useState<{ id: string; email: string; name: string; role: string; last_login_at: string | null; disabled: number }[]>([]);
  const [me, setMe] = useState('');
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const load = useCallback(() => api<{ items: typeof items; me: string }>('/api/admin/users').then((r) => { if (r.ok) { setItems(r.items); setMe(r.me); } }), []);
  useEffect(() => { load(); }, [load]);
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await api('/api/admin/users', { body: Object.fromEntries(f) });
    setMsg(r.ok ? { t: 'ok', m: 'User added. Share the password with them securely; they can change it under My account.' } : { t: 'err', m: r.message || 'Failed' });
    if (r.ok) { (e.target as HTMLFormElement).reset(); load(); }
  }
  async function patch(id: string, body: object) {
    const r = await api(`/api/admin/users/${id}`, { method: 'PATCH', body });
    setMsg(r.ok ? { t: 'ok', m: 'Updated.' } : { t: 'err', m: r.message || 'Failed' }); load();
  }
  return (
    <>
      <h1>Users</h1>
      <p className="adm-sub"><strong>Owners</strong> can do everything, including viewing submissions and changing settings. <strong>Editors</strong> can edit pages, listings and images, but can’t see personal information from forms.</p>
      {msg && <p className={`adm-msg${msg.t === 'err' ? ' adm-msg--err' : ''}`} role="status">{msg.m}</p>}
      <table className="adm-table" style={{ marginBottom: 20 }}>
        <thead><tr><th>Name</th><th>Role</th><th>Last sign-in</th><th></th></tr></thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.name}<div className="adm-help">{u.email}</div></td>
              <td><select className="adm-input" style={{ width: 'auto' }} value={u.role} onChange={(e) => patch(u.id, { role: e.target.value })} aria-label={`Role for ${u.name}`}><option value="owner">Owner</option><option value="editor">Editor</option></select></td>
              <td className="adm-help">{u.last_login_at ? fmt(u.last_login_at) : 'Never'}{u.disabled ? ' · disabled' : ''}</td>
              <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {u.id !== me && <button className="adm-btn adm-btn--2 adm-btn--sm" onClick={() => patch(u.id, { disabled: !u.disabled })}>{u.disabled ? 'Enable' : 'Disable'}</button>}
                <button className="adm-btn adm-btn--2 adm-btn--sm" onClick={() => { const p = prompt('New password (12+ characters):'); if (p) patch(u.id, { password: p }); }}>Set password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="adm-card" onSubmit={add}>
        <h2>Add a user</h2>
        <div className="adm-field"><label htmlFor="nu-name">Name</label><input id="nu-name" name="name" type="text" required /></div>
        <div className="adm-field"><label htmlFor="nu-email">Email</label><input id="nu-email" name="email" type="email" required /></div>
        <div className="adm-field"><label htmlFor="nu-role">Role</label><select id="nu-role" name="role" defaultValue="editor"><option value="editor">Editor</option><option value="owner">Owner</option></select></div>
        <div className="adm-field"><label htmlFor="nu-pw">Temporary password</label><span className="adm-help">At least 12 characters.</span><input id="nu-pw" name="password" type="password" autoComplete="new-password" required minLength={12} /></div>
        <button className="adm-btn" type="submit">Add user</button>
      </form>
    </>
  );
}

// ---------------------------------------------------------------- Account
export function Account() {
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get('next') !== f.get('confirm')) { setMsg({ t: 'err', m: 'The new passwords don’t match.' }); return; }
    const r = await api('/api/admin/account', { method: 'PUT', body: { current: f.get('current'), next: f.get('next') } });
    setMsg(r.ok ? { t: 'ok', m: 'Password changed.' } : { t: 'err', m: r.message || 'Failed' });
    if (r.ok) (e.target as HTMLFormElement).reset();
  }
  return (
    <>
      <h1>My account</h1>
      {msg && <p className={`adm-msg${msg.t === 'err' ? ' adm-msg--err' : ''}`} role="status">{msg.m}</p>}
      <form className="adm-card" onSubmit={submit} style={{ maxWidth: 480 }}>
        <h2>Change password</h2>
        <div className="adm-field"><label htmlFor="cur">Current password</label><input id="cur" name="current" type="password" autoComplete="current-password" required /></div>
        <div className="adm-field"><label htmlFor="nxt">New password</label><span className="adm-help">At least 12 characters. A short sentence works well.</span><input id="nxt" name="next" type="password" autoComplete="new-password" required minLength={12} /></div>
        <div className="adm-field"><label htmlFor="cnf">Confirm new password</label><input id="cnf" name="confirm" type="password" autoComplete="new-password" required /></div>
        <button className="adm-btn" type="submit">Change password</button>
      </form>
    </>
  );
}
