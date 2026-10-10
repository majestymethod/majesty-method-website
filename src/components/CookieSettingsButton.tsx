'use client';
export function CookieSettingsButton({ className = 'footer-button' }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event('mm:open-cookie-settings'))}>
      Cookie settings
    </button>
  );
}
