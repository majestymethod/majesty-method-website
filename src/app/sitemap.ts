import type { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';
import { siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths: [string, number][] = [
    ['/', 1], ['/majesty-method', 0.9], ['/majesty-method/bootcamp', 0.8], ['/majesty-method/acceleration', 0.8],
    ['/majesty-method/webinars', 0.8], ['/majesty-method/courses', 0.6], ['/majesty-method/resources', 0.7],
    ['/tenderiq', 0.9], ['/contact', 0.6], ['/legal/privacy', 0.3], ['/legal/cookies', 0.2], ['/legal/terms', 0.2], ['/legal/paia', 0.2],
  ];
  return paths.map(([p, priority]) => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority }));
}
