import Link from 'next/link';
import { getDoc, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { Facts, Faqs } from '@/components/PageHero';
import { Picture } from '@/components/Picture';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { JsonLd } from '@/components/JsonLd';
import { lines } from '@/components/Lines';
import { Prose, num } from '@/components/Prose';
import { breadcrumbLd, courseLd, faqLd } from '@/lib/structured-data';

type Block = { title: string; body: string };
interface Bootcamp {
  image: ImageRef | null; headline: string; intro: string; value: string; facts: { label: string; value: string }[];
  problem: Block; vision: Block; modulesTitle: string; modules: Block[]; modulesNote: string;
  audience: Block; format: Block; start: { title: string; steps: Block[] }; closing: Block;
  register: Block; faqs: { q: string; a: string }[];
  seo: { title: string; description: string };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Bootcamp>('bootcamp').seo, '/majesty-method/bootcamp', 'majesty');
}

export default async function BootcampPage() {
  const c = getDoc<Bootcamp>('bootcamp', await isPreview());
  return (
    <>
      <section className="split-hero surface--emerald hero-lit" aria-labelledby="bootcamp-title">
        <div className="container split-hero__grid split-hero__grid--media-first split-hero__grid--text-first-mobile">
          {c.image && (
            <div className="media media--framed split-hero__media">
              <Picture image={c.image} sizes="(max-width: 860px) 100vw, 45vw" priority />
            </div>
          )}
          <div>
            <p className="crumb"><Link href="/majesty-method#paths">Programmes and services</Link></p>
            <h1 id="bootcamp-title" style={{ fontSize: 'var(--t-2xl)' }}>{c.headline}</h1>
            <p className="lead">{c.intro}</p>
            {lines(c.value).length > 0 && <ul className="ticks" style={{ marginTop: 'var(--s-5)' }}>{lines(c.value).map((v) => <li key={v}>{v}</li>)}</ul>}
            <div className="btn-row">
              <Link className="btn" href="#register">Register for the Bootcamp</Link>
              <Link className="btn btn--secondary" href="#get-started">How to get started</Link>
            </div>
            <Facts items={c.facts} />
          </div>
        </div>
      </section>

      {c.problem.body && (
        <section className="section section--tight" aria-labelledby="problem-title">
          <div className="container split-copy">
            <div className="split-copy__head"><span className="rule-gold" aria-hidden="true" /><h2 id="problem-title" className="h2">{c.problem.title}</h2></div>
            <Prose text={c.problem.body} className="prose--lead" />
          </div>
        </section>
      )}

      {c.vision.body && (
        <section className="section section--tight" aria-labelledby="vision-title">
          <div className="container">
            <div className="block block--dark block--emerald feature-block">
              <span className="rule-gold" aria-hidden="true" />
              <h2 id="vision-title" className="h2--sm">{c.vision.title}</h2>
              <Prose text={c.vision.body} />
            </div>
          </div>
        </section>
      )}

      {c.modules.length > 0 && (
        <section id="learn" className="section section--tight" aria-labelledby="modules-title">
          <div className="container">
            <div className="section-head"><h2 id="modules-title" className="h2">{c.modulesTitle}</h2></div>
            <ol className="numbered numbered--3">
              {c.modules.map((m, i) => (
                <li key={m.title} className="block card">
                  <span className="numbered__n" aria-hidden="true">{num(i)}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </li>
              ))}
            </ol>
            {c.modulesNote && <p className="aside-note" style={{ maxWidth: '80ch' }}>{c.modulesNote}</p>}
          </div>
        </section>
      )}

      {c.audience.body && (
        <section className="section section--tight" aria-labelledby="who-title">
          <div className="container split-copy">
            <div className="split-copy__head"><span className="rule-gold" aria-hidden="true" /><h2 id="who-title" className="h2">{c.audience.title}</h2></div>
            <Prose text={c.audience.body} className="prose--lead" />
          </div>
        </section>
      )}

      {c.format.body && (
        <section className="section surface--onyx" aria-labelledby="format-title">
          <div className="container">
            <div className="feature-block feature-block--wide">
              <span className="rule-gold" aria-hidden="true" />
              <h2 id="format-title" className="h2">{c.format.title}</h2>
              <Prose text={c.format.body} className="prose--lead prose--cols" />
            </div>
          </div>
        </section>
      )}

      {c.closing.title && (
        <section className="section section--tight" aria-labelledby="closing-title">
          <div className="container closing">
            <span className="rule-gold" aria-hidden="true" />
            <h2 id="closing-title">{c.closing.title}</h2>
            <p className="lead">{c.closing.body}</p>
          </div>
        </section>
      )}

      <section id="get-started" className="section section--tight" aria-labelledby="start-title">
        <div className="container">
          <div className="section-head"><h2 id="start-title" className="h2">{c.start.title}</h2></div>
          <ol className="steps3">
            {c.start.steps.map((s) => (
              <li key={s.title} className="block"><h3>{s.title}</h3><p>{s.body}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="register" className="section surface--emerald" aria-labelledby="register-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="register-title" className="h2--sm">{c.register.title}</h2>
            <p className="muted">{c.register.body}</p>
          </div>
          <SiteForm formKey="bootcamp" />
        </div>
      </section>

      {c.faqs.length > 0 && (
        <section className="section section--tight" aria-labelledby="faq-title">
          <div className="container narrow">
            <div className="section-head"><h2 id="faq-title" className="h2--sm">Frequently asked questions</h2></div>
            <Faqs items={c.faqs} />
          </div>
        </section>
      )}

      <ContactStrip body="Ask us anything about the Founder Marketing Bootcamp before you register." type="Founder Bootcamp" />
      <JsonLd data={[
        courseLd('The Founder Marketing Bootcamp', '/majesty-method/bootcamp', c.intro),
        faqLd(c.faqs),
        breadcrumbLd([{ name: 'Majesty Method', path: '/majesty-method' }, { name: 'Founder Marketing Bootcamp', path: '/majesty-method/bootcamp' }]),
      ]} />
    </>
  );
}
