// Internal page used to render the default social share images (public/og/*.jpg).
// Enabled only when OG_PREVIEW is set. Not linked or indexed. Regenerate with scripts/render-og.py.
import { notFound } from 'next/navigation';
export const metadata = { robots: { index: false } };
export default async function Og({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (process.env.NODE_ENV === 'production' && !process.env.OG_PREVIEW) notFound();
  const tiq = brand === 'tenderiq';
  const box: React.CSSProperties = { width: 1200, height: 630, position: 'fixed', inset: 0, zIndex: 999, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: 'var(--font)' };
  return tiq ? (
    <div style={{ ...box, background: 'url(/textures/white-stone.webp) center/cover, #fff' }}>
      <div style={{ display: 'grid', gap: 22, justifyItems: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 112, letterSpacing: '-0.02em', color: '#5a0060', margin: 0, lineHeight: 1 }}>TenderIQ</p>
        <p style={{ fontWeight: 500, fontSize: 38, color: '#171717', maxWidth: 900, lineHeight: 1.3 }}>Find tender opportunities in South Africa that fit your business.</p>
        <p style={{ fontWeight: 600, fontSize: 22, color: '#86681f', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Tender Intelligence · by Majesty Method</p>
      </div>
    </div>
  ) : (
    <div style={{ ...box, background: 'linear-gradient(rgba(8,10,10,.55), rgba(8,10,10,.6)), url(/media/seed-entry-architecture-1600.webp) center 40%/cover', color: '#fff', filter: 'none' }}>
      <div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/seed-logo-mark-320.webp" alt="" style={{ width: 170 }} />
        <p style={{ fontWeight: 600, fontSize: 64, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, paddingLeft: '0.2em' }}>Majesty Method</p>
        <p style={{ fontWeight: 500, fontSize: 24, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#dcc078', paddingLeft: '0.24em' }}>Strategy. Power. Elevation.</p>
        <p style={{ fontWeight: 500, fontSize: 28, color: 'rgba(255,255,255,.9)', marginTop: 8 }}>AI • Marketing • Brand Strategy</p>
      </div>
    </div>
  );
}
