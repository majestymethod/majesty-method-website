// Internal page used once to render the default social share images (public/og/*.jpg).
// Kept so the images can be regenerated after a brand change. Not linked or indexed.
import { notFound } from 'next/navigation';
export const metadata = { robots: { index: false } };
export default async function Og({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (process.env.NODE_ENV === 'production' && !process.env.OG_PREVIEW) notFound();
  const tiq = brand === 'tenderiq';
  return (
    <div style={{ width: 1200, height: 630, position: 'fixed', inset: 0, zIndex: 999, background: tiq ? '#f8f5ee' : `url(/media/seed-hero-entry-1600.webp) center/cover`, display: 'flex', alignItems: 'center', padding: '0 96px', gap: 56 }}>
      {tiq ? (
        <div style={{ borderLeft: '6px solid #4b287d', paddingLeft: 48 }}>
          <p style={{ font: '700 104px/1 var(--sans)', letterSpacing: '-0.04em', color: '#4b287d', margin: 0 }}>TenderIQ</p>
          <p style={{ font: '500 40px/1.3 var(--sans)', color: '#20231f', marginTop: 28, maxWidth: 820 }}>Find tender opportunities worth pursuing — and see what they require before you commit.</p>
          <p style={{ font: '500 24px/1 var(--sans)', color: '#7e6124', marginTop: 36 }}>by Majesty Method</p>
        </div>
      ) : (<>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/seed-logo-mark-320.webp" alt="" style={{ width: 230 }} />
        <div>
          <p style={{ font: '400 84px/1.05 var(--serif)', color: '#20231f', margin: 0 }}>Majesty Method</p>
          <p style={{ font: '500 30px/1.3 var(--sans)', color: '#5c5d55', marginTop: 20 }}>AI • Marketing • Brand Strategy</p>
          <p style={{ font: '400 34px/1.3 var(--serif)', color: '#7e6124', marginTop: 32 }}>Maximum value. Minimum unnecessary effort.</p>
        </div>
      </>)}
    </div>
  );
}
