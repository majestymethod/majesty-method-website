import type { Metadata, Viewport } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './globals.css';
import { getSettings } from '@/lib/content/store';
import { CookieConsent } from '@/components/CookieConsent';
import { PreviewBar } from '@/components/PreviewBar';
import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Majesty Method', template: '%s — Majesty Method' },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const s = getSettings();
  return (
    <html lang="en-ZA">
      <body>
        <PreviewBar />
        {children}
        <CookieConsent provider={s.analytics.provider} ga4Id={s.analytics.ga4Id} version={s.cookieConsentVersion} />
      </body>
    </html>
  );
}
