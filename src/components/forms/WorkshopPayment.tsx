'use client';
import { useState } from 'react';

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button type="button" className="copy-btn" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export function WorkshopPayment({ businessName }: { businessName?: string }) {
  return (
    <div className="payment-card">
      <h3>Payment Details</h3>
      <p className="payment-card__amount">R250</p>
      <dl className="payment-card__details">
        <div>
          <dt>Bank</dt>
          <dd>FNB / RMB</dd>
        </div>
        <div>
          <dt>Account holder</dt>
          <dd>Majesty Method</dd>
        </div>
        <div>
          <dt>Account number</dt>
          <dd>
            <code>63228551338</code>
            <CopyBtn text="63228551338" label="account number" />
          </dd>
        </div>
        <div>
          <dt>Branch code</dt>
          <dd>
            <code>25065</code>
            <CopyBtn text="25065" label="branch code" />
          </dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd>{businessName || 'Your business name'}</dd>
        </div>
      </dl>
      <div className="payment-card__note">
        <p>
          Once paid, send your proof of payment to{' '}
          <a href="mailto:admin@majestymethod.com">admin@majestymethod.com</a>{' '}
          with your business name as the reference.
        </p>
      </div>
    </div>
  );
}
