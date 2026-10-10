'use client';
import { useState } from 'react';

export default function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError('');
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), password: f.get('password') }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) { window.location.href = '/admin'; return; }
    setError(data.message || 'Sign-in failed.'); setBusy(false);
  }
  return (
    <main className="adm-login">
      <form onSubmit={submit} noValidate>
        <h1 style={{ font: '600 22px/1.2 var(--sans)', marginBottom: 6 }}>Sign in to the website editor</h1>
        <p className="adm-help" style={{ marginBottom: 20 }}>For authorised Majesty Method team members.</p>
        {error && <p className="adm-msg adm-msg--err" role="alert">{error}</p>}
        <div className="adm-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required /></div>
        <div className="adm-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <button className="adm-btn" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
