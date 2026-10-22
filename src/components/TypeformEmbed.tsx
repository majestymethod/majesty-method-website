'use client';

import { useEffect } from 'react';

declare global {
  interface Window { tf?: { load?: () => void } }
}

const SCRIPT_SRC = 'https://embed.typeform.com/next/embed.js';

/**
 * A Typeform form shown inside the page. Typeform hosts the form and receives the answers.
 * A plain link is always shown underneath in case the embed is blocked (ad blockers, strict networks).
 */
export function TypeformEmbed({ formId, title, height = 600 }: { formId: string; title: string; height?: number }) {
  useEffect(() => {
    // Load Typeform's script once; on later client-side page changes, ask it to pick up the new form.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) { window.tf?.load?.(); return; }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, [formId]);

  const url = `https://form.typeform.com/to/${formId}`;
  return (
    <div className="typeform">
      <div
        className="typeform__frame"
        data-tf-widget={formId}
        data-tf-opacity="100"
        data-tf-iframe-props={`title=${title}`}
        data-tf-transitive-search-params=""
        data-tf-medium="snippet"
        style={{ width: '100%', height }}
      />
      <p className="typeform__fallback">
        Form not showing? <a href={url} target="_blank" rel="noopener noreferrer">Open the form in a new tab<span className="visually-hidden"> (opens Typeform)</span></a>.
      </p>
    </div>
  );
}
