'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { FormDef, FormField } from '@/lib/forms/definitions';
import { validateValues, type Values } from '@/lib/forms/validate';
import { Download } from '../Icons';

export interface ClientFormProps {
  formKey: string;
  fields: FormField[];
  submitLabel: string;
  privacyLabel: string;
  marketingLabel: string | null;
  renderToken: string;
  context?: { webinarId?: string; resourceId?: string };
  initialValues?: Record<string, string>;
  headingLevel?: 'h2' | 'h3';
  compact?: boolean;
  onSuccessContinue?: never;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';
interface Success { title: string; message: string; joining?: string; downloadUrl?: string; webinarTitle?: string }

const FULL = new Set(['textarea', 'radio', 'checkboxes']);

function newKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function DynamicForm(props: ClientFormProps) {
  const { formKey, fields, submitLabel, privacyLabel, marketingLabel, renderToken, context, initialValues, headingLevel = 'h3', compact } = props;
  const uid = useId();
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    for (const f of fields) v[f.key] = f.type === 'checkboxes' ? [] : initialValues?.[f.key] ?? '';
    return v;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<Success | null>(null);
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const idem = useRef<string>('');
  const hpRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => { idem.current = newKey(); }, []);
  useEffect(() => { if (success) successRef.current?.focus(); }, [success]);

  const id = (k: string) => `${uid}-${k}`;
  const set = (k: string, v: string | string[]) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (touchedSubmit && errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const runClientValidation = () => {
    const { errors: errs } = validateValues({ fields } as FormDef, values);
    if (!privacy) errs.__privacy = 'Please confirm you have read the privacy notice.';
    return errs;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return; // prevent double submission
    setTouchedSubmit(true);
    const errs = runClientValidation();
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus('error');
      setMessage('');
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch(`/api/forms/${formKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values, idempotencyKey: idem.current, renderToken, privacyAck: privacy, marketingConsent: marketing,
          sourcePage: window.location.pathname, context, hp: hpRef.current?.value || '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
        setSuccess({ title: data.successTitle, message: data.successMessage, ...(data.extra || {}) });
        return;
      }
      setStatus('error');
      if (data.errors) { setErrors(data.errors); requestAnimationFrame(() => summaryRef.current?.focus()); }
      setMessage(data.message || 'Your submission could not be sent. Your answers are still here — try again.');
      if (!data.errors) requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setStatus('error');
      setMessage('We couldn’t reach the server. Check your connection and try again — your answers are still here.');
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  if (success) {
    const H = headingLevel;
    return (
      <div className="form-success" ref={successRef} tabIndex={-1} role="status" aria-live="polite">
        <H>{success.title}</H>
        <p>{success.message}</p>
        {success.webinarTitle && <p><strong>Session:</strong> {success.webinarTitle}</p>}
        {success.joining && (
          <div className="note">
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Joining instructions</p>
            <p style={{ whiteSpace: 'pre-line' }}>{success.joining}</p>
          </div>
        )}
        {success.downloadUrl && (
          <p><a className="btn" href={success.downloadUrl}><Download /> Download now</a></p>
        )}
      </div>
    );
  }

  const errorList = Object.entries(errors);
  const fieldLabel = (k: string) => (k === '__privacy' ? 'Privacy notice' : fields.find((f) => f.key === k)?.label ?? k);

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-describedby={`${uid}-status`}>
      <div ref={summaryRef} tabIndex={-1} id={`${uid}-status`} aria-live="assertive">
        {status === 'error' && (errorList.length > 0 || message) && (
          <div className="alert" role="alert">
            <h3>{errorList.length ? 'Check the highlighted fields' : 'Your submission was not sent'}</h3>
            {message && !errorList.length && <p>{message}</p>}
            {errorList.length > 0 && (
              <ul>
                {errorList.map(([k, v]) => (
                  <li key={k}><a href={`#${id(k)}`}>{fieldLabel(k)}: {v}</a></li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="form__grid" style={compact ? { gridTemplateColumns: '1fr' } : undefined}>
        {fields.map((f) => (
          <FieldInput key={f.key} f={f} id={id(f.key)} value={values[f.key]} error={errors[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
      </div>

      {/* Honeypot: hidden from people and assistive tech */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${uid}-hp`}>Leave this field empty</label>
        <input id={`${uid}-hp`} ref={hpRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="consents">
        <div className="field">
          <label className="choice" htmlFor={id('__privacy')}>
            <input id={id('__privacy')} type="checkbox" checked={privacy} onChange={(e) => { setPrivacy(e.target.checked); if (e.target.checked) setErrors((x) => { const n = { ...x }; delete n.__privacy; return n; }); }}
              aria-invalid={!!errors.__privacy} aria-describedby={errors.__privacy ? `${id('__privacy')}-err` : undefined} required />
            <span>
              <strong>{privacyLabel}</strong>{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener">Read the privacy notice<span className="visually-hidden"> (opens in a new tab)</span></a>
              <span className="field__req"> (required)</span>
            </span>
          </label>
          {errors.__privacy && <p className="field__error" id={`${id('__privacy')}-err`}>{errors.__privacy}</p>}
        </div>
        {marketingLabel && (
          <label className="choice" htmlFor={id('__marketing')}>
            <input id={id('__marketing')} type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <span>{marketingLabel} <span className="field__req">(optional)</span></span>
          </label>
        )}
      </div>

      <div className="form__actions">
        <button className="btn" type="submit" disabled={status === 'submitting'} aria-disabled={status === 'submitting'}>
          {status === 'submitting' ? (<><span className="spinner" aria-hidden="true" /> Sending…</>) : submitLabel}
        </button>
        <span className="form__fineprint" aria-live="polite">{status === 'submitting' ? 'Sending your details securely…' : ''}</span>
      </div>
    </form>
  );
}

function FieldInput({ f, id, value, error, onChange }: { f: FormField; id: string; value: string | string[]; error?: string; onChange: (v: string | string[]) => void }) {
  const helpId = f.help ? `${id}-help` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(' ') || undefined;
  const req = f.required ? <span className="field__req"> (required)</span> : <span className="field__req"> (optional)</span>;
  const cls = `field${FULL.has(f.type) || (f.type === 'text' && (f.maxLength ?? 0) > 400) ? ' field--full' : ''}`;
  const common = { id, name: f.key, 'aria-invalid': !!error, 'aria-describedby': describedBy, required: f.required } as const;

  if (f.type === 'radio' || f.type === 'checkboxes') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className={cls}>
        <fieldset aria-describedby={describedBy} aria-invalid={!!error}>
          <legend id={id} tabIndex={-1}>{f.label}{req}</legend>
          {f.help && <p className="field__help" id={helpId}>{f.help}</p>}
          {f.options?.map((o, i) => (
            <label className="choice" key={o} htmlFor={`${id}-${i}`}>
              {f.type === 'radio' ? (
                <input id={`${id}-${i}`} type="radio" name={f.key} value={o} checked={value === o} onChange={() => onChange(o)} required={f.required} />
              ) : (
                <input id={`${id}-${i}`} type="checkbox" name={f.key} value={o} checked={arr.includes(o)} onChange={(e) => onChange(e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))} />
              )}
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
        {error && <p className="field__error" id={errId}>{error}</p>}
      </div>
    );
  }
  return (
    <div className={cls}>
      <label htmlFor={id}>{f.label}{req}</label>
      {f.help && <p className="field__help" id={helpId}>{f.help}</p>}
      {f.type === 'textarea' ? (
        <textarea {...common} value={value as string} maxLength={f.maxLength} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : f.type === 'select' ? (
        <select {...common} value={value as string} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input {...common} type={f.type} value={value as string} maxLength={f.maxLength} placeholder={f.placeholder}
          autoComplete={f.autocomplete} inputMode={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : undefined}
          onChange={(e) => onChange(e.target.value)} />
      )}
      {error && <p className="field__error" id={errId}>{error}</p>}
    </div>
  );
}
