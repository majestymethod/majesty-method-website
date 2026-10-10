'use client';
import { useEffect, useState } from 'react';
import type { FormDef, FormField, InputType } from '@/lib/forms/definitions';
import { api } from './client';

const TYPES: { v: InputType; l: string }[] = [
  { v: 'text', l: 'Short text' }, { v: 'textarea', l: 'Long text' }, { v: 'email', l: 'Email' }, { v: 'tel', l: 'Phone' },
  { v: 'url', l: 'Website address' }, { v: 'select', l: 'Dropdown (one answer)' }, { v: 'radio', l: 'Multiple choice (one answer)' }, { v: 'checkboxes', l: 'Checkboxes (several answers)' },
];
const CHOICE = ['select', 'radio', 'checkboxes'];

export function FormBuilder({ formKey }: { formKey: string }) {
  const [form, setForm] = useState<FormDef | null>(null);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api<{ form: FormDef }>(`/api/admin/forms/${formKey}`).then((r) => r.ok ? setForm(r.form) : setMsg({ t: 'err', m: r.message || 'Could not load' })); }, [formKey]);
  if (!form) return <p>{msg?.m ?? 'Loading…'}</p>;

  const set = (patch: Partial<FormDef>) => { setForm({ ...form, ...patch }); setDirty(true); setMsg(null); };
  const setField = (i: number, patch: Partial<FormField>) => set({ fields: form.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const move = (i: number, d: number) => { const n = [...form.fields]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set({ fields: n }); };
  const addField = () => {
    let k = 'question'; let n = 1;
    while (form.fields.some((f) => f.key === `${k}${n}`)) n++;
    set({ fields: [...form.fields, { key: `${k}${n}`, label: 'New question', type: 'text', required: false, enabled: true }] });
  };

  async function save() {
    setBusy(true);
    const r = await api<{ form: FormDef }>(`/api/admin/forms/${formKey}`, { method: 'PUT', body: { form } });
    setBusy(false);
    if (!r.ok) { setMsg({ t: 'err', m: r.message || 'Save failed' }); return; }
    setForm(r.form); setDirty(false); setMsg({ t: 'ok', m: 'Saved. The live form uses these settings now.' });
  }

  const txt = (label: string, key: keyof FormDef, help?: string, area?: boolean) => (
    <div className="adm-field">
      <label htmlFor={`fd-${String(key)}`}>{label}</label>{help && <span className="adm-help">{help}</span>}
      {area ? <textarea id={`fd-${String(key)}`} value={String(form[key] ?? '')} onChange={(e) => set({ [key]: e.target.value } as Partial<FormDef>)} />
        : <input id={`fd-${String(key)}`} type="text" value={String(form[key] ?? '')} onChange={(e) => set({ [key]: e.target.value } as Partial<FormDef>)} />}
    </div>
  );

  return (
    <>
      <p><a href="/admin/forms">← Forms</a></p>
      <h1>{form.title}</h1>
      <p className="adm-sub">{form.description}</p>
      <div className="adm-bar">
        <button className="adm-btn" type="button" onClick={save} disabled={busy || !dirty}>Save form</button>
        <span className="spacer" />
        {dirty && <span className="pill pill--warn">Unsaved changes</span>}
      </div>
      {msg && <p className={`adm-msg${msg.t === 'err' ? ' adm-msg--err' : ''}`} role="status">{msg.m}</p>}
      <p className="adm-msg adm-msg--warn">
        How changes behave: new questions and edited wording apply to new submissions only — past answers are kept as they were. A question’s key can’t be changed once it has answers; add a new question instead. System questions (marked “system”) can be reworded but not removed.
      </p>

      <section className="adm-card">
        <h2>Questions</h2>
        {form.fields.map((f, i) => (
          <details className="adm-fieldrow" key={f.key} open={false}>
            <summary>
              <strong>{f.label || '(no label)'}</strong>
              <span className="adm-help">{TYPES.find((t) => t.v === f.type)?.l} · {f.required ? 'required' : 'optional'}{f.locked ? ' · system' : ''}</span>
              {!f.enabled && <span className="pill">Hidden</span>}
              {f.inferred && <span className="pill pill--warn">Options to confirm</span>}
              <span style={{ flex: 1 }} />
              <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={(e) => { e.preventDefault(); move(i, -1); }} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={(e) => { e.preventDefault(); move(i, 1); }} disabled={i === form.fields.length - 1} aria-label="Move down">↓</button>
              {!f.locked && <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={(e) => { e.preventDefault(); if (confirm('Remove this question? Past answers are kept.')) set({ fields: form.fields.filter((_, j) => j !== i) }); }}>Remove</button>}
            </summary>
            <div>
              <div className="adm-field full"><label htmlFor={`l-${f.key}`}>Question</label><input id={`l-${f.key}`} type="text" value={f.label} onChange={(e) => setField(i, { label: e.target.value })} /></div>
              <div className="adm-field"><label htmlFor={`t-${f.key}`}>Answer type</label>
                <select id={`t-${f.key}`} value={f.type} disabled={f.locked} onChange={(e) => setField(i, { type: e.target.value as InputType })}>{TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select></div>
              <div className="adm-field"><label htmlFor={`k-${f.key}`}>Key (internal)</label><input id={`k-${f.key}`} type="text" value={f.key} disabled /></div>
              <div className="adm-field full"><label htmlFor={`h-${f.key}`}>Help text (optional)</label><input id={`h-${f.key}`} type="text" value={f.help ?? ''} onChange={(e) => setField(i, { help: e.target.value })} /></div>
              {CHOICE.includes(f.type) && (
                <div className="adm-field full"><label htmlFor={`o-${f.key}`}>Answer options (one per line)</label>
                  {f.inferred && <span className="adm-help">These options were inferred from existing Google Form responses. Check them against the original form, then untick “to confirm” below.</span>}
                  <textarea id={`o-${f.key}`} rows={Math.max(3, (f.options?.length ?? 0) + 1)} value={(f.options ?? []).join('\n')} onChange={(e) => setField(i, { options: e.target.value.split('\n') })} /></div>
              )}
              {!CHOICE.includes(f.type) && <div className="adm-field"><label htmlFor={`p-${f.key}`}>Placeholder (optional)</label><input id={`p-${f.key}`} type="text" value={f.placeholder ?? ''} onChange={(e) => setField(i, { placeholder: e.target.value })} /></div>}
              {!CHOICE.includes(f.type) && <div className="adm-field"><label htmlFor={`m-${f.key}`}>Maximum length (characters)</label><input id={`m-${f.key}`} type="number" value={f.maxLength ?? ''} onChange={(e) => setField(i, { maxLength: Number(e.target.value) || undefined })} /></div>}
              {form.sheets.enabled && <div className="adm-field full"><label htmlFor={`s-${f.key}`}>Google Sheet column header</label><span className="adm-help">Must match the column header in the sheet exactly. Leave empty to add the answer to a “Website: additional answers” column.</span><input id={`s-${f.key}`} type="text" value={f.sheetColumn ?? ''} onChange={(e) => setField(i, { sheetColumn: e.target.value })} /></div>}
              <label className="adm-check"><input type="checkbox" checked={f.required} disabled={f.locked && (f.key === 'name' || f.key === 'email')} onChange={(e) => setField(i, { required: e.target.checked })} /> Required</label>
              <label className="adm-check"><input type="checkbox" checked={f.enabled} disabled={f.locked} onChange={(e) => setField(i, { enabled: e.target.checked })} /> Show on the form</label>
              {f.inferred && <label className="adm-check"><input type="checkbox" checked onChange={() => setField(i, { inferred: false })} /> Options still to confirm</label>}
            </div>
          </details>
        ))}
        <button type="button" className="adm-btn adm-btn--2 adm-btn--sm" onClick={addField}>Add question</button>
      </section>

      <section className="adm-card">
        <h2>Wording</h2>
        {txt('Submit button text', 'submitLabel')}
        {txt('Confirmation heading', 'successTitle')}
        {txt('Confirmation message', 'successMessage', 'Shown only after the submission is saved. Don’t promise an email unless email delivery is set up.', true)}
        {txt('Privacy acknowledgement wording', 'privacyLabel')}
        <label className="adm-check"><input type="checkbox" checked={form.marketingConsent} onChange={(e) => set({ marketingConsent: e.target.checked })} /> Offer an optional marketing consent checkbox (wording is set in Business details)</label>
      </section>

      <section className="adm-card">
        <h2>Notifications</h2>
        <p className="adm-help" style={{ marginBottom: 12 }}>Emails are only sent when email delivery (SMTP) is configured on the server. The dashboard shows whether it is.</p>
        {txt('Notify these team addresses', 'notifyTo', 'Comma-separated. Leave empty to use the main contact email.')}
        {formKey === 'contact' && txt('Route by enquiry type', 'routing', 'One rule per line, e.g. “TenderIQ = tenders@example.com”. Unmatched types go to the addresses above.', true)}
        <label className="adm-check" style={{ marginBottom: 12 }}><input type="checkbox" checked={form.sendAcknowledgement} onChange={(e) => set({ sendAcknowledgement: e.target.checked })} /> Send an acknowledgement email to the person</label>
        {form.sendAcknowledgement && (<>
          {txt('Acknowledgement subject', 'acknowledgementSubject')}
          {txt('Acknowledgement message', 'acknowledgementBody', 'Use {{name}} for their first name. For webinars, {{webinar}} and {{joining}} insert the session and joining instructions.', true)}
        </>)}
      </section>

      <section className="adm-card">
        <h2>Google Sheets</h2>
        <label className="adm-check" style={{ marginBottom: 12 }}><input type="checkbox" checked={form.sheets.enabled} onChange={(e) => set({ sheets: { ...form.sheets, enabled: e.target.checked } })} /> Copy each submission to a Google Sheet</label>
        {form.sheets.enabled && (<>
          <div className="adm-field"><label htmlFor="sh-name">Sheet (tab) name</label><input id="sh-name" type="text" value={form.sheets.sheetName} onChange={(e) => set({ sheets: { ...form.sheets, sheetName: e.target.value } })} /></div>
          <div className="adm-field"><label htmlFor="sh-ts">Timestamp column header</label><input id="sh-ts" type="text" value={form.sheets.timestampColumn} onChange={(e) => set({ sheets: { ...form.sheets, timestampColumn: e.target.value } })} /></div>
          <div className="adm-field"><label htmlFor="sh-em">“Email address” column header (Google’s collected-email column)</label><input id="sh-em" type="text" value={form.sheets.respondentEmailColumn} onChange={(e) => set({ sheets: { ...form.sheets, respondentEmailColumn: e.target.value } })} /></div>
          <p className="adm-help">The spreadsheet itself is chosen when the Apps Script is set up (see the setup guide). Columns are matched by header text, so their order doesn’t matter.</p>
        </>)}
      </section>
    </>
  );
}
