import Link from 'next/link';
import { getDoc } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { lines } from '@/components/Lines';

type Cta = { label: string; href: string };
interface Tiq {
  hero: { headline: string; body: string; primary: Cta; secondary: Cta };
  problem: { title: string; intro: string; items: string };
  outcomes: { title: string; items: { title: string; body: string }[] };
  example: { title: string; disclaimer: string; steps: string };
  how: { title: string; steps: { title: string; body: string }[] };
  trust: { title: string; items: string };
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
        <div className="docviz__lines">
          {[92, 100, 78, 96, 64].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}
        </div>
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
  return (
    <>
      <section className="tiq-hero" aria-labelledby="tiq-title">
        <div className="container tiq-hero__grid">
          <div>
            <h1 id="tiq-title">{c.hero.headline}</h1>
            <p className="lead">{c.hero.body}</p>
            <div className="btn-row">
              {c.hero.primary.label && <Link className="btn" href={c.hero.primary.href}>{c.hero.primary.label}</Link>}
              {c.hero.secondary.label && <Link className="btn btn--secondary" href={c.hero.secondary.href}>{c.hero.secondary.label}</Link>}
            </div>
          </div>
          <DocumentIllustration />
        </div>
      </section>

      <section id="why" className="section section--white" aria-labelledby="problem-title">
        <div className="container">
          <div className="section-head">
            <h2 id="problem-title" className="h2">{c.problem.title}</h2>
            <p className="lead">{c.problem.intro}</p>
          </div>
          <ul className="problems">{lines(c.problem.items).map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      </section>

      <section className="section" aria-labelledby="outcomes-title">
        <div className="container">
          <div className="section-head"><h2 id="outcomes-title" className="h2">{c.outcomes.title}</h2></div>
          <div className="outcomes">
            {c.outcomes.items.map((o) => (
              <div className="outcome" key={o.title}><h3>{o.title}</h3><p>{o.body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="example-title">
        <div className="container scenario">
          <div className="stack">
            <h2 id="example-title" className="h2--sm">{c.example.title}</h2>
            <p className="scenario__label">{c.example.disclaimer}</p>
          </div>
          <ol>{lines(c.example.steps).map((s) => <li key={s}>{s}</li>)}</ol>
        </div>
      </section>

      <section id="how-it-works" className="section" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head"><h2 id="how-title" className="h2">{c.how.title}</h2></div>
          <ol className="flow">
            {c.how.steps.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.body}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--flush" aria-labelledby="trust-title">
        <div className="container">
          <div className="trust">
            <h2 id="trust-title">{c.trust.title}</h2>
            <ul className="ticks">{lines(c.trust.items).map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="register" className="section section--white" aria-labelledby="register-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="register-title" className="h2--sm">{c.register.title}</h2>
            <p className="muted">{c.register.body}</p>
          </div>
          <SiteForm formKey="tenderiq" />
        </div>
      </section>

      <ContactStrip title="Questions about TenderIQ?" body="Talk to the TenderIQ team before you register." type="TenderIQ" brand="tenderiq" />
    </>
  );
}
