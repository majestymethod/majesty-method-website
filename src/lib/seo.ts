import 'server-only';
import type { Metadata } from 'next';
import { getMedia } from './media';
import type { ImageRef } from './content/store';

export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function pageMetadata(seo: { title?: string; description?: string; image?: ImageRef | null } | undefined, path: string, brand: 'majesty' | 'tenderiq'): Metadata {
  const title = seo?.title || (brand === 'tenderiq' ? 'TenderIQ' : 'Majesty Method');
  const description = seo?.description || '';
  const m = getMedia(seo?.image?.id);
  const ogImage = m ? `/media/${(m.variants.find((v) => v.w >= 1080) ?? m.variants[m.variants.length - 1]).file}` : `/og/${brand}.jpg`;
  const siteName = brand === 'tenderiq' ? 'TenderIQ' : 'Majesty Method';
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', title, description, url: path, siteName, locale: 'en_ZA', images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}
