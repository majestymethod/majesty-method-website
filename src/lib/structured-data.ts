import 'server-only';
import { getSettings } from './content/store';
import { getMedia } from './media';
import { siteUrl } from './seo';

// Structured data built only from verified, visible information (no ratings, no invented address).
const isReal = (s?: string) => !!s && !/^\[.*\]$/.test(s.trim());

export function organizationLd() {
  const s = getSettings();
  const base = siteUrl();
  const logo = getMedia(s.logo?.id);
  const lv = logo?.variants.find((v) => v.w >= 320) ?? logo?.variants[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: s.brandName,
    ...(isReal(s.registeredName) ? { legalName: s.registeredName } : {}),
    url: `${base}/majesty-method`,
    ...(lv ? { logo: `${base}/media/${lv.file}` } : {}),
    slogan: s.tagline,
    description: 'Majesty Method helps South African founders build marketing strategy, lead generation and practical AI capability through training, implementation and strategic support.',
    ...(s.email ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone.replace(/\s/g, '') } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'Johannesburg', addressRegion: 'Gauteng', addressCountry: 'ZA' },
    areaServed: { '@type': 'Country', name: 'South Africa' },
    founder: { '@type': 'Person', name: 'Adelade Nyarirangwe' },
    sameAs: s.socials.filter((x) => x.url).map((x) => x.url),
    brand: [{ '@type': 'Brand', name: 'TenderIQ', url: `${base}/tenderiq` }],
  };
}

export function websiteLd() {
  const base = siteUrl();
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${base}/#website`, name: 'Majesty Method & TenderIQ', url: base, inLanguage: 'en-ZA', publisher: { '@id': `${base}/#organization` } };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${base}${it.path}` })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  const shown = faqs.filter((f) => f.q && f.a && !/\[/.test(f.a));
  if (!shown.length) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: shown.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function serviceLd(name: string, path: string, description: string, serviceType: string) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org', '@type': 'Service', name, serviceType, description, url: `${base}${path}`,
    provider: { '@id': `${base}/#organization` }, areaServed: { '@type': 'Country', name: 'South Africa' },
  };
}

export function courseLd(name: string, path: string, description: string) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org', '@type': 'Course', name, description, url: `${base}${path}`, inLanguage: 'en-ZA',
    provider: { '@type': 'Organization', name: 'Majesty Method', sameAs: `${base}/majesty-method` },
  };
}
