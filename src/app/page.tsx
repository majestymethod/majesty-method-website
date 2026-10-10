import Link from 'next/link';
import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { Picture } from '@/components/Picture';
import { LegalLinks } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { organizationLd, websiteLd } from '@/lib/structured-data';
import { getMedia } from '@/lib/media';

interface Entry {
  headline: string; supporting: string; heroImage: ImageRef; monochrome: boolean; choicePrompt: string;
  majesty: { label: string; description: string }; tenderiq: { label: string; description: string };
  seo: { title: string; description: string; image: ImageRef | null };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Entry>('entry').seo, '/', 'majesty');
}

export default async function EntryPage() {
  const c = getDoc<Entry>('entry', await isPreview());
  const s = getSettings();
  const logo = getMedia(s.logo?.id);
  const logoV = logo?.variants.find((v) => v.w >= 320) ?? logo?.variants[0];
  return (
    <div className="entry" data-brand="majesty">
      <a className="skip-link" href="#choose">Skip to the choices</a>
      <main className="entry-hero">
        <div className="entry-hero__media" style={c.monochrome ? { filter: 'grayscale(1)' } : undefined}>
          <Picture image={c.heroImage} priority sizes="100vw" decorative />
        </div>
        <div className="container entry-hero__inner">
          <div className="entry-logo">
            {logoV && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/media/${logoV.file}`} alt="" width={120} height={120} />
            )}
            <p className="entry-logo__name">{s.brandName}</p>
            {s.tagline && <p className="entry-logo__tag">{s.tagline}</p>}
          </div>
          <h1>{c.headline}</h1>
          {c.supporting && <p className="entry-hero__support">{c.supporting}</p>}
          <nav id="choose" className="doors" aria-label={c.choicePrompt}>
            <Link href="/majesty-method" className="door door--mm">
              <span className="door__title">{c.majesty.label}</span>
              {c.majesty.description && <span className="door__desc">{c.majesty.description}</span>}
            </Link>
            <Link href="/tenderiq" className="door door--tiq">
              <span className="door__title">{c.tenderiq.label}</span>
              {c.tenderiq.description && <span className="door__desc">{c.tenderiq.description}</span>}
            </Link>
          </nav>
        </div>
      </main>
      <footer className="entry-footer">
        <div className="container entry-footer__inner">
          <p>
            © {new Date().getFullYear()} {s.brandName}
            {s.location ? ` · ${s.location}` : ''}
            {s.email ? <> · <a href={`mailto:${s.email}`}>{s.email}</a></> : null}
            {s.phone ? <> · <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></> : null}
          </p>
          <LegalLinks />
        </div>
      </footer>
      <JsonLd data={[organizationLd(), websiteLd()]} />
    </div>
  );
}
