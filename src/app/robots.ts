import type { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/unsubscribe'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
