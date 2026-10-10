import Link from 'next/link';
import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { Picture } from '@/components/Picture';
import { ArrowRight } from '@/components/Icons';
import { LegalLinks } from '@/components/SiteFooter';
import { pageMetadata, siteUrl } from '@/lib/seo';
import { getMedia } from '@/lib/media';

interface Entry {
  headline: string; supporting: string; heroImage: ImageRef; choicePrompt: string;
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
  const orgLd = {
    '@context': 'https://schema.org', '@type': 'Organization', name: s.brandName, url: siteUrl(),
    ...(logoV ? { logo: `${siteUrl()}/media/${logoV.file}` } : {}),
    ...(s.email ? { email: s.email } : {}),
  };
  return (
    <div className="entry" data-brand="majesty">
      <a className="skip-link" href="#choose">Skip to the choices</a>
      <main className="entry-hero">
        <div className="entry-hero__media">
          <Picture image={c.heroImage} priority sizes="100vw" decorative />
        </div>
        <div className="container entry-hero__top">
          <div className="entry-hero__logo">
            {logoV && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/media/${logoV.file}`} alt="" width={104} height={104} />
            )}
            <p className="entry-hero__wordmark">
              <span>MAJESTY METHOD</span>
              <small>{s.descriptor}</small>
            </p>
          </div>
        </div>
        <div className="container entry-hero__body">
          <div>
            <h1>{c.headline}</h1>
            <p className="entry-hero__support">{c.supporting}</p>
          </div>
        </div>
        <nav id="choose" className="doors" aria-labelledby="choose-label">
          <div className="container">
            <p className="doors__prompt" id="choose-label">{c.choicePrompt}</p>
            <div className="doors__grid">
              <Link href="/majesty-method" className="door door--mm">
                <span>
                  <span className="door__title" style={{ display: 'block' }}>{c.majesty.label}</span>
                  <span className="door__desc" style={{ display: 'block' }}>{c.majesty.description}</span>
                </span>
                <span className="door__arrow" aria-hidden="true"><ArrowRight size={22} /></span>
              </Link>
              <Link href="/tenderiq" className="door door--tiq">
                <span>
                  <span className="door__title" style={{ display: 'block' }}>{c.tenderiq.label}</span>
                  <span className="door__desc" style={{ display: 'block' }}>{c.tenderiq.description}</span>
                </span>
                <span className="door__arrow" aria-hidden="true"><ArrowRight size={22} /></span>
              </Link>
            </div>
          </div>
        </nav>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}
