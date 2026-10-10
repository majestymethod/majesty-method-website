'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props { provider: 'none' | 'ga4'; ga4Id: string; version: string }
interface Choice { v: string; analytics: boolean; ts: string }

const COOKIE = 'mm_consent';

function readChoice(): Choice | null {
  try {
    const m = document.cookie.match(/(?:^|; )mm_consent=([^;]*)/);
    return m ? (JSON.parse(decodeURIComponent(m[1])) as Choice) : null;
  } catch { return null; }
}
function writeChoice(c: Choice) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax${secure}`;
}
function clearAnalyticsCookies() {
  for (const c of document.cookie.split('; ')) {
    const name = c.split('=')[0];
    if (/^_ga/.test(name)) {
      const host = location.hostname;
      for (const domain of ['', `; Domain=${host}`, `; Domain=.${host.replace(/^www\./, '')}`]) document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
    }
  }
}

let gaLoaded = false;
function loadGa(id: string) {
  if (gaLoaded || !/^G-[A-Z0-9]+$/i.test(id)) return;
  gaLoaded = true;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() { // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  // Never send form contents: only page views, with IP anonymisation and no ad signals.
  w.gtag('config', id, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

export function CookieConsent({ provider, ga4Id, version }: Props) {
  const usesOptional = provider === 'ga4' && !!ga4Id;
  const [banner, setBanner] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const c = readChoice();
    if (c && c.v === version) {
      setAnalytics(c.analytics);
      if (usesOptional && c.analytics) loadGa(ga4Id);
    } else if (usesOptional) {
      setBanner(true);
    }
    const open = () => {
      openerRef.current = document.activeElement as HTMLElement;
      setAnalytics(readChoice()?.analytics ?? false);
      dialogRef.current?.showModal();
    };
    window.addEventListener('mm:open-cookie-settings', open);
    return () => window.removeEventListener('mm:open-cookie-settings', open);
  }, [usesOptional, ga4Id, version]);

  const save = useCallback((allowAnalytics: boolean) => {
    writeChoice({ v: version, analytics: allowAnalytics, ts: new Date().toISOString() });
    setAnalytics(allowAnalytics);
    setBanner(false);
    if (allowAnalytics && usesOptional) loadGa(ga4Id);
    if (!allowAnalytics) {
      clearAnalyticsCookies();
      if (gaLoaded) window.location.reload(); // fully unload analytics already running
    }
  }, [version, usesOptional, ga4Id]);

  const closeDialog = () => { dialogRef.current?.close(); openerRef.current?.focus?.(); };

  return (
    <>
      {banner && (
        <section className="consent-banner" aria-labelledby="consent-title" role="region">
          <h2 id="consent-title">Cookies on this website</h2>
          <p>We use essential cookies to make the site work. With your permission, we’d also like to use analytics cookies to understand how the site is used. Analytics never see what you type into forms.</p>
          <div className="btn-row">
            <button className="btn" type="button" onClick={() => save(true)}>Accept analytics</button>
            <button className="btn btn--secondary" type="button" onClick={() => save(false)}>Reject analytics</button>
            <button className="footer-button" style={{ color: 'var(--accent)', fontWeight: 600 }} type="button" onClick={() => window.dispatchEvent(new Event('mm:open-cookie-settings'))}>Settings</button>
          </div>
        </section>
      )}
      <dialog ref={dialogRef} className="consent-dialog" aria-labelledby="cookie-settings-title" onCancel={(e) => { e.preventDefault(); closeDialog(); }}>
        <div className="consent-dialog__inner">
          <h2 id="cookie-settings-title">Cookie settings</h2>
          <div>
            <div className="consent-row">
              <div>
                <h3>Essential</h3>
                <p>Needed for the site to work, such as remembering these choices. Always on.</p>
              </div>
              <span className="muted" style={{ fontSize: 'var(--t-sm)' }}>Always on</span>
            </div>
            <div className="consent-row">
              <div>
                <h3 id="analytics-label">Analytics</h3>
                {usesOptional
                  ? <p>Helps us understand which pages are useful (Google Analytics). Off unless you turn it on.</p>
                  : <p>This website does not currently use analytics cookies.</p>}
              </div>
              <input type="checkbox" className="switch" aria-labelledby="analytics-label" checked={usesOptional && analytics} disabled={!usesOptional}
                onChange={(e) => setAnalytics(e.target.checked)} />
            </div>
            <div className="consent-row">
              <div>
                <h3>Marketing</h3>
                <p>This website does not use advertising or marketing cookies.</p>
              </div>
              <span className="muted" style={{ fontSize: 'var(--t-sm)' }}>Not used</span>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn" type="button" onClick={() => { save(usesOptional && analytics); closeDialog(); }}>Save choices</button>
            <button className="btn btn--secondary" type="button" onClick={closeDialog}>Cancel</button>
            <a href="/legal/cookies" style={{ fontSize: 'var(--t-sm)' }}>Cookie policy</a>
          </div>
        </div>
      </dialog>
    </>
  );
}
