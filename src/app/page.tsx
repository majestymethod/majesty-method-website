import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { GrandEntrance } from '@/components/GrandEntrance';
import { LegalLinks } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { organizationLd, websiteLd } from '@/lib/structured-data';

interface Entry {
  headline: string; cue: string; choicePrompt: string;
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
      <link rel="preload" as="image" href="/entrance/leaf-l.webp" fetchPriority="high" />
      <link rel="preload" as="image" href="/entrance/leaf-r.webp" fetchPriority="high" />
      <link rel="preload" as="image" href="/entrance/base-1672.webp" imageSrcSet="/entrance/base-1100.webp 1100w, /entrance/base-1672.webp 1672w" imageSizes="max(100vw, 178svh)" />
      <main>
        <GrandEntrance heading={c.headline} cue={c.cue} choicePrompt={c.choicePrompt} majesty={c.majesty} tenderiq={c.tenderiq} />
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
