export const dynamic = 'force-dynamic';
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { getDocMeta } from '@/lib/content/store';

const PAGES: [string, string, number][] = [
  ['/', 'entry', 1], ['/majesty-method', 'mm_home', 0.9], ['/majesty-method/bootcamp', 'bootcamp', 0.8],
  ['/majesty-method/acceleration', 'acceleration', 0.8], ['/majesty-method/webinars', 'webinars_page', 0.8],
  ['/majesty-method/courses', 'courses_page', 0.6], ['/majesty-method/resources', 'resources_page', 0.7],
  ['/tenderiq', 'tenderiq', 0.9], ['/tenderiq/demo', 'tenderiq', 0.7], ['/contact', 'contact_page', 0.6], ['/legal/privacy', 'legal_privacy', 0.3],
  ['/legal/cookies', 'legal_cookies', 0.2], ['/legal/terms', 'legal_terms', 0.2], ['/legal/paia', 'legal_paia', 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PAGES.map(([p, key, priority]) => {
    const m = getDocMeta(key);
    return { url: `${base}${p}`, lastModified: m?.published_at ? new Date(m.published_at) : undefined, changeFrequency: 'weekly' as const, priority };
  });
}
