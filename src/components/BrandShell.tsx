import { getDoc, getSettings } from '@/lib/content/store';
import { getMedia } from '@/lib/media';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

interface Nav { majesty: { label: string; href: string }[]; majestyCta: { label: string; href: string }; tenderiq: { label: string; href: string }[]; tenderiqCta: { label: string; href: string } }

export async function BrandShell({ brand, children }: { brand: 'majesty' | 'tenderiq'; children: React.ReactNode }) {
  const s = getSettings();
  const nav = getDoc<Nav>('navigation');
  const logo = getMedia(brand === 'majesty' ? s.logo?.id : s.tenderiqLogo?.id);
  const smallest = logo?.variants.find((v) => v.w >= 80) ?? logo?.variants[0];
  return (
    <div data-brand={brand}>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader
        brand={brand}
        homeHref={brand === 'majesty' ? '/majesty-method' : '/tenderiq'}
        logoSrc={smallest ? `/media/${smallest.file}` : null}
        logoAlt={brand === 'majesty' ? s.logo?.alt || s.brandName : s.tenderiqLogo?.alt || 'TenderIQ'}
        name={brand === 'majesty' ? s.brandName : 'TenderIQ'}
        links={brand === 'majesty' ? nav.majesty : nav.tenderiq}
        cta={brand === 'majesty' ? nav.majestyCta : nav.tenderiqCta}
        announcement={brand === 'majesty' && s.announcement?.enabled && s.announcement.text ? s.announcement : null}
      />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter brand={brand} />
    </div>
  );
}
