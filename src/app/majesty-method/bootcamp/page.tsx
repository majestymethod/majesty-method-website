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
import { breadcrumbLd, courseLd, faqLd } from '@/lib/structured-data';

interface Bootcamp {
  image: ImageRef | null; headline: string; intro: string; value: string; facts: { label: string; value: string }[];
  curriculumTitle: string; curriculum: { week: string; title: string; topics: string }[];
  whoForTitle: string; whoFor: string; start: { title: string; steps: { title: string; body: string }[] };
  register: { title: string; body: string }; faqs: { q: string; a: string }[];
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

      <section className="section section--tight" aria-labelledby="curriculum-title">
        <div className="container">
          <div className="section-head"><h2 id="curriculum-title" className="h2">{c.curriculumTitle}</h2></div>
          <ol className="curriculum">
            {c.curriculum.map((w) => (
              <li key={w.title} className="block">
                <p className="curriculum__week">{w.week}</p>
                <div>
                  <h3>{w.title}</h3>
                  <ul>{lines(w.topics).map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {lines(c.whoFor).length > 0 && (
        <section className="section section--tight" aria-labelledby="who-title">
          <div className="container">
            <div className="block block--dark block--emerald">
              <h2 id="who-title" className="h2--sm" style={{ marginBottom: 'var(--s-4)' }}>{c.whoForTitle}</h2>
              <ul className="ticks grid grid--2">{lines(c.whoFor).map((o) => <li key={o}>{o}</li>)}</ul>
            </div>
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

      <ContactStrip body="Ask us anything about the Founder Bootcamp before you register." type="Founder Bootcamp" />
      <JsonLd data={[
        courseLd('Founder Bootcamp', '/majesty-method/bootcamp', c.intro),
        faqLd(c.faqs),
        breadcrumbLd([{ name: 'Majesty Method', path: '/majesty-method' }, { name: 'Founder Bootcamp', path: '/majesty-method/bootcamp' }]),
      ]} />
    </>
  );
}
