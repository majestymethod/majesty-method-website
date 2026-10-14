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
import { Prose, num } from '@/components/Prose';
import { breadcrumbLd, faqLd, serviceLd } from '@/lib/structured-data';

type Cta = { label: string; href: string };
type Block = { title: string; body: string };
interface Tiq {
  hero: { kicker: string; headline: string; body: string; tagline: string; primary: Cta; secondary: Cta };
  pillars: Block[];
  problem: { kicker: string; title: string; intro: string; items: string; closing: string };
  how: { kicker: string; title: string; steps: Block[] };
  questions: { kicker: string; title: string; intro: string; items: Block[] };
  outcomes: { title: string; items: Block[]; note: string };
  powers: { kicker: string; title: string; items: Block[] };
  comparison: { kicker: string; title: string; leftLabel: string; rightLabel: string; rows: { capability: string; traditional: string; tenderiq: string }[]; note: string };
  coverage: { kicker: string; title: string; body: string; provinces: string };
  industries: { title: string; intro: string; items: { label: string; description: string; image: ImageRef | null }[]; note: string };
  example: { title: string; disclaimer: string; steps: string };
  pricing: { kicker: string; title: string; price: string; period: string; summary: string; inclusions: string; note: string; ctaLabel: string };
  join: { title: string; steps: Block[] };
  register: Block;
  trust: { title: string; items: string };
  faqs: { q: string; a: string }[];
  closing: Block & { ctaLabel: string };
  seo: { title: string; description: string };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Tiq>('tenderiq').seo, '/tenderiq', 'tenderiq');
}

/** Static sample of an opportunity summary — an illustration, not live product output. */
function SampleReport() {
  const reqs: [string, 'ok' | 'attn' | 'gap', string][] = [
    ['Tax compliance status', 'ok', 'Meets'],
    ['Required grading / registration', 'ok', 'Meets'],
    ['Compulsory briefing session', 'attn', 'Check date'],
    ['Qualified project manager', 'gap', 'Gap'],
  ];
  return (
    <figure className="docviz" aria-label="Illustration: a sample TenderIQ opportunity summary with requirements, a profile match and a gap">
      <div className="docviz__paper" aria-hidden="true">
        <p className="docviz__ref">Sample report · Closing in 18 days · Limpopo</p>
        <p className="docviz__title">Supply and installation of electrical reticulation</p>
        <div className="docviz__match"><span>Profile match</span><span className="docviz__bar"><i style={{ width: '78%' }} /></span><strong>Strong</strong></div>
        <div className="docviz__panel">
          <h3>Key requirements</h3>
          {reqs.map(([label, state, note]) => (
            <div className="docviz__req" key={label}>
              <span className={`docviz__dot docviz__dot--${state}`} />
              <span>{label}</span>
              <span className={`docviz__state docviz__state--${state}`}>{note}</span>
            </div>
          ))}
        </div>
        <p className="docviz__next"><strong>Possible route:</strong> partner with an eligible provider, if the tender rules permit.</p>
      </div>
      <figcaption className="docviz__caption">Illustration of a TenderIQ opportunity summary. Not a real tender or company.</figcaption>
    </figure>
  );
}

export default async function TenderIqPage() {
  const c = getDoc<Tiq>('tenderiq', await isPreview());
  const problems = lines(c.problem.items);
  const provinces = lines(c.coverage.provinces);
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
            {c.hero.tagline && <p className="hero-tagline">{c.hero.tagline}</p>}
          </div>
          <SampleReport />
        </div>
      </section>

      {c.pillars.length > 0 && (
        <section className="section section--tight" aria-label="TenderIQ at a glance">
          <div className="container">
            <ul className="pillars">
              {c.pillars.map((p, i) => (
                <li key={p.title} className="block card">
                  <span className="numbered__n" aria-hidden="true">{num(i)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="why" className="section section--tight" aria-labelledby="problem-title">
        <div className="container">
          <div className="section-head section-head--center">
            {c.problem.kicker && <p className="kicker">{c.problem.kicker}</p>}
            <h2 id="problem-title" className="h2">{c.problem.title}</h2>
            <Prose text={c.problem.intro} className="prose--center" />
          </div>
          <ul className={`tiles tiles--purple${problems.length === 7 ? ' tiles--7' : ''}`}>
            {problems.map((p) => <li key={p} className="tile"><p className="tile__text" style={{ color: 'var(--white)' }}>{p}</p></li>)}
          </ul>
          {c.problem.closing && <p className="pull-line pull-line--center">{c.problem.closing}</p>}
        </div>
      </section>

      <section id="how-it-works" className="section section--tight" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head section-head--center">
            {c.how.kicker && <p className="kicker">{c.how.kicker}</p>}
            <h2 id="how-title" className="h2">{c.how.title}</h2>
          </div>
          <ol className={`flow${c.how.steps.length === 4 ? ' flow--4' : ''}`}>
            {c.how.steps.map((s) => <li key={s.title} className="block"><h3>{s.title}</h3><p>{s.body}</p></li>)}
          </ol>
        </div>
      </section>

      {c.questions.items.length > 0 && (
        <section className="section section--tight" aria-labelledby="questions-title">
          <div className="container">
            <div className="section-head section-head--center">
              {c.questions.kicker && <p className="kicker">{c.questions.kicker}</p>}
              <h2 id="questions-title" className="h2">{c.questions.title}</h2>
              {c.questions.intro && <p className="lead">{c.questions.intro}</p>}
            </div>
            <ol className="questions">
              {c.questions.items.map((q) => <li key={q.title} className="block card"><h3>{q.title}</h3><p>{q.body}</p></li>)}
            </ol>
          </div>
        </section>
      )}

      <section className="section section--tight" aria-labelledby="outcomes-title">
        <div className="container">
          <div className="section-head section-head--center"><h2 id="outcomes-title" className="h2">{c.outcomes.title}</h2></div>
          <ul className={`tiles tiles--charcoal${c.outcomes.items.length === 7 ? ' tiles--7' : ''}`}>
            {c.outcomes.items.map((o) => <li key={o.title} className="tile"><h3>{o.title}</h3><p>{o.body}</p></li>)}
          </ul>
          {c.outcomes.note && <p className="aside-note" style={{ maxWidth: '80ch', marginInline: 'auto', textAlign: 'center', justifyContent: 'center' }}>{c.outcomes.note}</p>}
        </div>
      </section>

      {c.powers.items.length > 0 && (
        <section className="section surface--purple" aria-labelledby="powers-title">
          <div className="container">
            <div className="section-head">
              {c.powers.kicker && <p className="kicker">{c.powers.kicker}</p>}
              <h2 id="powers-title" className="h2">{c.powers.title}</h2>
            </div>
            <ol className="numbered numbered--2">
              {c.powers.items.map((p, i) => (
                <li key={p.title} className="block">
                  <span className="numbered__n" aria-hidden="true">{num(i)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {c.comparison.rows.length > 0 && (
        <section className="section section--tight" aria-labelledby="compare-title">
          <div className="container">
            <div className="section-head section-head--center">
              {c.comparison.kicker && <p className="kicker">{c.comparison.kicker}</p>}
              <h2 id="compare-title" className="h2">{c.comparison.title}</h2>
            </div>
            <div className="compare-wrap">
              <table className="compare">
                <thead>
                  <tr><th scope="col"><span className="visually-hidden">Capability</span></th><th scope="col">{c.comparison.leftLabel}</th><th scope="col" className="compare__tiq">{c.comparison.rightLabel}</th></tr>
                </thead>
                <tbody>
                  {c.comparison.rows.map((r) => (
                    <tr key={r.capability}>
                      <th scope="row">{r.capability}</th>
                      <td data-label={c.comparison.leftLabel}>{r.traditional}</td>
                      <td data-label={c.comparison.rightLabel} className="compare__tiq">{r.tenderiq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.comparison.note && <p className="muted" style={{ marginTop: 'var(--s-4)', fontSize: 'var(--t-sm)', textAlign: 'center' }}>{c.comparison.note}</p>}
          </div>
        </section>
      )}

      {provinces.length > 0 && (
        <section className="section section--tight" aria-labelledby="coverage-title">
          <div className="container coverage">
            <div>
              {c.coverage.kicker && <p className="kicker">{c.coverage.kicker}</p>}
              <h2 id="coverage-title" className="h2" style={{ marginTop: 'var(--s-3)' }}>{c.coverage.title}</h2>
              <p className="lead">{c.coverage.body}</p>
            </div>
            <ul className="provinces">{provinces.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        </section>
      )}

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

      {c.pricing.price && (
        <section id="pricing" className="section section--tight" aria-labelledby="pricing-title">
          <div className="container pricing">
            <div className="pricing__intro">
              {c.pricing.kicker && <p className="kicker">{c.pricing.kicker}</p>}
              <h2 className="h2" style={{ marginTop: 'var(--s-3)' }}>{c.join.title}</h2>
              <ol className="steps" style={{ marginTop: 'var(--s-5)' }}>
                {c.join.steps.map((s) => <li key={s.title}><div><h3>{s.title}</h3><p>{s.body}</p></div></li>)}
              </ol>
            </div>
            <div className="pricing__card">
              <h3 id="pricing-title">{c.pricing.title}</h3>
              <p className="pricing__price"><strong>{c.pricing.price}</strong> <span>{c.pricing.period}</span></p>
              <p className="pricing__summary">{c.pricing.summary}</p>
              <ul className="ticks">{lines(c.pricing.inclusions).map((x) => <li key={x}>{x}</li>)}</ul>
              <Link className="btn" href="#register" style={{ width: '100%', marginTop: 'var(--s-5)' }}>{c.pricing.ctaLabel}</Link>
              {c.pricing.note && <p className="pricing__note">{c.pricing.note}</p>}
            </div>
          </div>
        </section>
      )}

      <section id="register" className="section surface--purple" aria-labelledby="register-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="register-title" className="h2--sm">{c.register.title}</h2>
            <p className="muted">{c.register.body}</p>
          </div>
          <SiteForm formKey="tenderiq" />
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

      {c.faqs.length > 0 && (
        <section className="section section--tight" aria-labelledby="tiq-faq-title">
          <div className="container narrow">
            <div className="section-head"><h2 id="tiq-faq-title" className="h2--sm">Questions about tenders and TenderIQ</h2></div>
            <Faqs items={c.faqs} />
          </div>
        </section>
      )}

      {c.closing.title && (
        <section className="section section--tight" aria-labelledby="tiq-closing-title">
          <div className="container closing">
            <span className="rule-gold" aria-hidden="true" />
            <h2 id="tiq-closing-title">{c.closing.title}</h2>
            <p className="lead">{c.closing.body}</p>
            <div className="btn-row" style={{ justifyContent: 'center' }}><Link className="btn" href="#register">{c.closing.ctaLabel}</Link></div>
          </div>
        </section>
      )}

      <ContactStrip title="Questions about TenderIQ?" body="Talk to the TenderIQ team before you join." type="TenderIQ" brand="tenderiq" />
      <JsonLd data={[
        serviceLd('TenderIQ', '/tenderiq', c.hero.body, 'AI-powered tender opportunity matching and assessment'),
        faqLd(c.faqs),
        breadcrumbLd([{ name: 'TenderIQ', path: '/tenderiq' }]),
      ]} />
    </>
  );
}
