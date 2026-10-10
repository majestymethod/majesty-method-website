import { notFound } from 'next/navigation';
import { getDoc, getSettings } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { BrandShell } from '@/components/BrandShell';
import { Markdown } from '@/components/Markdown';

const SLUGS: Record<string, string> = { privacy: 'legal_privacy', cookies: 'legal_cookies', terms: 'legal_terms', paia: 'legal_paia' };
interface Legal { title: string; lastUpdated: string; reviewStatus: string; body: string; seo: { title: string; description: string } }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS[slug]) return {};
  return pageMetadata(getDoc<Legal>(SLUGS[slug]).seo, `/legal/${slug}`, 'majesty');
}

function CookieTable() {
  const s = getSettings();
  const rows: [string, string, string, string, string][] = [
    ['mm_consent', 'Essential', 'Remembers your cookie choices', '12 months', 'This website'],
    ['mm_session', 'Essential', 'Keeps authorised team members signed in to the editor (not set for visitors)', '7 days', 'This website'],
    ['mm_preview', 'Essential', 'Lets signed-in editors preview unpublished changes (not set for visitors)', 'Browser session', 'This website'],
  ];
  if (s.analytics.provider === 'ga4' && s.analytics.ga4Id) {
    rows.push(['_ga, _ga_*', 'Analytics (only with your consent)', 'Distinguishes visitors to produce anonymous usage statistics', 'Up to 2 years', 'Google Analytics']);
  }
  return (
    <table className="cookie-table">
      <caption className="visually-hidden">Cookies currently used on this website</caption>
      <thead><tr><th scope="col">Name</th><th scope="col">Category</th><th scope="col">Purpose</th><th scope="col">Duration</th><th scope="col">Set by</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>
            <td data-label="Name"><code>{r[0]}</code></td><td data-label="Category">{r[1]}</td><td data-label="Purpose">{r[2]}</td><td data-label="Duration">{r[3]}</td><td data-label="Set by">{r[4]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = SLUGS[slug];
  if (!key) notFound();
  const c = getDoc<Legal>(key, await isPreview());
  const s = getSettings();
  const vars: Record<string, string> = {
    brandName: s.brandName, registeredName: s.registeredName, legalStatus: s.legalStatus, registrationNumber: s.registrationNumber,
    vatNumber: s.vatNumber, physicalAddress: s.physicalAddress.replace(/\n/g, ', '), postalAddress: s.postalAddress.replace(/\n/g, ', '),
    email: s.email, phone: s.phone, ioName: s.informationOfficer.name, ioEmail: s.informationOfficer.email, ioPhone: s.informationOfficer.phone,
    retentionMonths: String(s.retentionMonths),
  };
  return (
    <BrandShell brand="majesty">
      <article className="legal">
        <div className="container">
          <h1 style={{ fontSize: 'var(--t-2xl)', fontWeight: 450 }}>{c.title}</h1>
          <p className="muted" style={{ marginTop: 'var(--s-3)' }}>Last updated: {c.lastUpdated}</p>
          {c.reviewStatus !== 'Reviewed' && (
            <p className="note legal-draft">This page is a draft and is awaiting review. Some details are still to be confirmed.</p>
          )}
          {slug === 'cookies' && <CookieTable />}
          <Markdown className="legal__body" source={c.body} vars={vars} />
        </div>
      </article>
    </BrandShell>
  );
}
