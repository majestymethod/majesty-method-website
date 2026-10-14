import { getDoc, getSettings } from '@/lib/content/store';
import { siteUrl } from '@/lib/seo';

// Optional plain-text summary for AI assistants (llmstxt.org convention).
// Supplementary only: it doesn't replace normal SEO and can't make any assistant recommend the business.
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = getSettings();
  const b = siteUrl();
  const tiq = getDoc<{ hero: { body: string }; trust: { items: string } }>('tenderiq');
  const boot = getDoc<{ intro: string }>('bootcamp');
  const acc = getDoc<{ intro: string }>('acceleration');
  const text = `# Majesty Method & TenderIQ

> ${s.brandName} (${s.descriptor}) is a marketing, AI and brand strategy company based in ${s.location}, South Africa. It helps founders and small businesses build marketing strategy, lead generation and practical AI capability. TenderIQ is its separate product for South African businesses that pursue tenders.

## Majesty Method
- [Majesty Method homepage](${b}/majesty-method): what the company does, who it helps, and ways to work with it.
- [The Founder Marketing Bootcamp](${b}/majesty-method/bootcamp): ${boot.intro}
- [Team Acceleration](${b}/majesty-method/acceleration): ${acc.intro}
- [The Founder Marketing Sessions](${b}/majesty-method/webinars): free Friday sessions on founder-led marketing, positioning, AI automation and turning marketing into revenue.
- [Courses](${b}/majesty-method/courses) and [free resources](${b}/majesty-method/resources).

## TenderIQ
- [TenderIQ](${b}/tenderiq): ${tiq.hero.body}
- Limitations: ${tiq.trust.items.split('\n').join(' ')}

## Contact
- [Contact form](${b}/contact)${s.email ? `\n- Email: ${s.email}` : ''}${s.phone ? `\n- Telephone: ${s.phone}` : ''}

## Policies
- [Privacy notice](${b}/legal/privacy), [Website terms](${b}/legal/terms)
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
