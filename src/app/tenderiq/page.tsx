import Link from 'next/link';
import { getDoc, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { Picture } from '@/components/Picture';
import { Faqs } from '@/components/PageHero';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { JsonLd } from '@/components/JsonLd';
import { lines } from '@/components/Lines';
import { breadcrumbLd, faqLd, serviceLd } from '@/lib/structured-data';

type Cta = { label: string; href: string };
interface Tiq {
  hero: { kicker: string; headline: string; body: string; primary: Cta; secondary: Cta };
  problem: { title: string; intro: string; items: string };
  outcomes: { title: string; items: { title: string; body: string }[] };
  industries: { title: string; intro: string; items: { label: string; description: string; image: ImageRef | null }[]; note: string };
  example: { title: string; disclaimer: string; steps: string };
  how: { title: string; steps: { title: string; body: string }[] };
  trust: { title: string; items: string };
  faqs: { q: string; a: string }[];
  register: { title: string; body: string };
  seo: { title: string; description: string };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Tiq>('tenderiq').seo, '/tenderiq', 'tenderiq');
}

/** Static illustration of the intended experience — not live product output. */
function DocumentIllustration() {
  const reqs: [string, 'ok' | 'attn' | 'todo', string][] = [
    ['Tax compliance status', 'ok', 'Available'],
    ['Required grading / registration', 'ok', 'Matches'],
    ['Compulsory briefing session', 'attn', 'Check date'],
    ['Company profile & references', 'todo', 'To prepare'],
  ];
  return (
    <figure className="docviz" aria-label="Illustration: a tender document with its key requirements summarised alongside">
      <div className="docviz__paper" aria-hidden="true">
        <p className="docviz__ref">Bid ref. ●●●/2026 · Closing in 18 days</p>
        <p className="docviz__title">Supply and installation of electrical reticulation</p>
        <div className="docviz__lines">{[92, 100, 78, 96, 64].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}</div>
        <div className="docviz__panel">
          <h3>Key requirements</h3>
          {reqs.map(([label, state, note]) => (
            <div className="docviz__req" key={label}>
              <span className={`docviz__dot${state === 'ok' ? ' docviz__dot--ok' : state === 'attn' ? ' docviz__dot--attn' : ''}`} />
              <span>{label}</span>
              <span className="docviz__state">{note}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="docviz__caption">Illustration of the intended experience. Not a real tender.</figcaption>
    </figure>
  );
}

export default async function TenderIqPage() {
  const c = getDoc<Tiq>('tenderiq', await isPreview());
  const problems = lines(c.problem.items);
  return (
    <>
      <section className="tiq-hero surface--purple hero-lit" aria-labelledby="tiq-title">
        <div className="container tiq-hero__grid">
          <div>
            {c.hero.kicker && <p className="kicker">{c.hero.kicker}</p>}
            <h1 id="tiq-title" style={{ marginTop: 'var(--s-3)' }}>{c.hero.headline}</h1>
            <p className="lead">{c.hero.body}</p>
            <div className="btn-row">
              {c.hero.primary.label && <Link className="btn" href={c.hero.primary.href}>{c.hero.primary.label}</Link>}
              {c.hero.secondary.label && <Link className="btn btn--secondary" href={c.hero.secondary.href}>{c.hero.secondary.label}</Link>}
            </div>
          </div>
          <DocumentIllustration />
        </div>
      </section>

      <section id="why" className="section section--tight" aria-labelledby="problem-title">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 id="problem-title" className="h2">{c.problem.title}</h2>
            <p className="lead">{c.problem.intro}</p>
          </div>
          <ul className={`tiles tiles--purple${problems.length === 7 ? ' tiles--7' : ''}`}>
            {problems.map((p) => <li key={p} className="tile"><p className="tile__text" style={{ color: 'var(--white)' }}>{p}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="outcomes-title">
        <div className="container">
          <div className="section-head section-head--center"><h2 id="outcomes-title" className="h2">{c.outcomes.title}</h2></div>
          <ul className={`tiles tiles--charcoal${c.outcomes.items.length === 7 ? ' tiles--7' : ''}`}>
            {c.outcomes.items.map((o) => <li key={o.title} className="tile"><h3>{o.title}</h3><p>{o.body}</p></li>)}
          </ul>
        </div>
      </section>

      {c.industries.items.length > 0 && (
        <section className="section section--tight" aria-labelledby="industries-title">
          <div className="container">
            <div className="section-head section-head--center">
              <h2 id="industries-title" className="h2">{c.industries.title}</h2>
              <p className="lead">{c.industries.intro}</p>
            </div>
            <div className="industries">
              {c.industries.items.map((it) => (
                <figure className="industry" key={it.label}>
                  {it.image ? (
                    <div className="media industry__media"><Picture image={it.image} sizes="(max-width: 860px) 100vw, 33vw" /></div>
                  ) : (
                    <div className="industry__placeholder" role="img" aria-label={`Photograph to come: ${it.label}`}>
                      <span><strong>{it.label}</strong>Photograph to come</span>
                    </div>
                  )}
                  <figcaption>{it.label}<span>{it.description}</span></figcaption>
                </figure>
              ))}
            </div>
            {c.industries.note && <p className="muted" style={{ marginTop: 'var(--s-5)', fontSize: 'var(--t-sm)', textAlign: 'center' }}>{c.industries.note}</p>}
          </div>
        </section>
      )}

      <section className="section section--tight" aria-labelledby="example-title">
        <div className="container scenario">
          <div className="stack">
            <h2 id="example-title" className="h2--sm">{c.example.title}</h2>
            <p className="block block--dark block--purple scenario__label">{c.example.disclaimer}</p>
          </div>
          <ol className="block">{lines(c.example.steps).map((s) => <li key={s}>{s}</li>)}</ol>
        </div>
      </section>

      <section id="how-it-works" className="section section--tight" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head section-head--center"><h2 id="how-title" className="h2">{c.how.title}</h2></div>
          <ol className="flow">
            {c.how.steps.map((s) => <li key={s.title} className="block"><h3>{s.title}</h3><p>{s.body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="trust-title">
        <div className="container">
          <div className="block block--dark block--purple" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
            <div className="rule-gold" aria-hidden="true" style={{ marginBottom: 'var(--s-4)' }} />
            <h2 id="trust-title" className="h2--sm">{c.trust.title}</h2>
            <ul className="ticks" style={{ marginTop: 'var(--s-5)', fontSize: 'var(--t-md)' }}>{lines(c.trust.items).map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="register" className="section surface--purple" aria-labelledby="register-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="register-title" className="h2--sm">{c.register.title}</h2>
            <p className="muted">{c.register.body}</p>
          </div>
          <SiteForm formKey="tenderiq" />
        </div>
      </section>

      {c.faqs.length > 0 && (
        <section className="section section--tight" aria-labelledby="tiq-faq-title">
          <div className="container narrow">
            <div className="section-head"><h2 id="tiq-faq-title" className="h2--sm">Questions about tenders and TenderIQ</h2></div>
            <Faqs items={c.faqs} />
          </div>
        </section>
      )}

      <ContactStrip title="Questions about TenderIQ?" body="Talk to the TenderIQ team before you register." type="TenderIQ" brand="tenderiq" />
      <JsonLd data={[
        serviceLd('TenderIQ', '/tenderiq', c.hero.body, 'Tender opportunity discovery and assessment'),
        faqLd(c.faqs),
        breadcrumbLd([{ name: 'TenderIQ', path: '/tenderiq' }]),
      ]} />
    </>
  );
}
