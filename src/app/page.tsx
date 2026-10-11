import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { HouseEntrance } from '@/components/HouseEntrance';
import { LegalLinks } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { organizationLd, websiteLd } from '@/lib/structured-data';

interface Entry {
  headline: string; cue: string; choicePrompt: string; returnLabel: string;
  majesty: { label: string; description: string }; tenderiq: { label: string; description: string };
  seo: { title: string; description: string; image: ImageRef | null };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Entry>('entry').seo, '/', 'majesty');
}

export default async function EntryPage() {
  const c = getDoc<Entry>('entry', await isPreview());
  const s = getSettings();
  return (
    <div className="entry" data-brand="majesty">
      <link rel="preload" as="image" href="/house/ext-1672.webp" imageSrcSet="/house/ext-1100.webp 1100w, /house/ext-1672.webp 1672w" imageSizes="max(100vw, 178svh)" fetchPriority="high" />
      <main>
        <HouseEntrance heading={c.headline} cue={c.cue} choicePrompt={c.choicePrompt} returnLabel={c.returnLabel} majesty={c.majesty} tenderiq={c.tenderiq} />
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
