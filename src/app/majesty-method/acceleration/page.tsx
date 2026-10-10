import Link from 'next/link';
import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { Picture } from '@/components/Picture';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { JsonLd } from '@/components/JsonLd';
import { lines } from '@/components/Lines';
import { breadcrumbLd, serviceLd } from '@/lib/structured-data';

interface Acc {
  image: ImageRef | null; title: string; headline: string; intro: string; challenge: { title: string; body: string };
  graduateHelps: string; graduateNote: string; provides: string; steps: { title: string; body: string }[];
  suitability: string; termsNote: string; enquiry: { title: string; body: string }; seo: { title: string; description: string };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Acc>('acceleration').seo, '/majesty-method/acceleration', 'majesty');
}

export default async function AccelerationPage() {
  const c = getDoc<Acc>('acceleration', await isPreview());
  const booking = getSettings().bookingUrl;
  return (
    <>
      <section className="split-hero" aria-labelledby="acc-title">
        <div className="container split-hero__grid">
          <div>
            <p className="crumb"><Link href="/majesty-method#paths">Programmes and services</Link></p>
            <p className="kicker">{c.title}</p>
            <h1 id="acc-title" style={{ fontSize: 'var(--t-2xl)', marginTop: 'var(--s-2)' }}>{c.headline}</h1>
            <p className="lead">{c.intro}</p>
            <div className="btn-row">
              <Link className="btn" href="#enquire">Book a discovery call</Link>
              <Link className="btn btn--secondary" href="#how">How it works</Link>
            </div>
          </div>
          {c.image && (
            <div className="media split-hero__media split-hero__media--land">
              <Picture image={c.image} sizes="(max-width: 860px) 100vw, 45vw" priority />
            </div>
          )}
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="challenge-title">
        <div className="container">
          <div className="block block--dark block--emerald" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
            <div className="rule-gold" aria-hidden="true" style={{ marginBottom: 'var(--s-4)' }} />
            <h2 id="challenge-title" className="h2--sm">{c.challenge.title}</h2>
            <p style={{ marginTop: 'var(--s-3)', fontSize: 'var(--t-md)', maxWidth: '70ch' }}>{c.challenge.body}</p>
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="helps-title">
        <div className="container">
          <div className="section-head"><h2 id="helps-title" className="h2--sm">What the graduate can help with</h2></div>
          <div className="block">
            <ul className="ticks grid grid--2">{lines(c.graduateHelps).map((x) => <li key={x}>{x}</li>)}</ul>
            {c.graduateNote && <p className="muted" style={{ marginTop: 'var(--s-5)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--line)' }}>{c.graduateNote}</p>}
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="provides-title">
        <div className="container">
          <div className="section-head"><h2 id="provides-title" className="h2--sm">What Majesty Method provides</h2></div>
          <ul className="grid grid--3" style={{ listStyle: 'none' }}>
            {lines(c.provides).map((x) => <li key={x} className="block card"><span className="card__mark" aria-hidden="true" /><p style={{ color: 'var(--ink)', fontWeight: 500 }}>{x}</p></li>)}
          </ul>
        </div>
      </section>

      <section id="how" className="section section--tight" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head">
            <h2 id="how-title" className="h2--sm">How the engagement works</h2>
            <p className="muted">{c.termsNote}</p>
          </div>
          <ol className="steps block">
            {c.steps.map((s) => <li key={s.title}><div><h3>{s.title}</h3><p>{s.body}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="fit-title">
        <div className="container">
          <div className="section-head"><h2 id="fit-title" className="h2--sm">It’s a good fit if</h2></div>
          <div className="block"><ul className="ticks grid grid--2">{lines(c.suitability).map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
      </section>

      <section id="enquire" className="section section--tight" aria-labelledby="enquire-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="enquire-title" className="h2--sm">{c.enquiry.title}</h2>
            <p className="muted">{c.enquiry.body}</p>
            {booking && (
              <p>
                <a className="btn btn--secondary" href={booking} target="_blank" rel="noopener noreferrer">
                  Choose a time in our calendar<span className="visually-hidden"> (opens booking page in a new tab)</span>
                </a>
              </p>
            )}
          </div>
          <SiteForm formKey="acceleration" />
        </div>
      </section>

      <ContactStrip title="Not sure this is the right fit?" body="Ask a question first. There’s no obligation." type="Business Acceleration" />
      <JsonLd data={[
        serviceLd(c.title, '/majesty-method/acceleration', c.intro, 'Marketing support and AI implementation for small businesses'),
        breadcrumbLd([{ name: 'Majesty Method', path: '/majesty-method' }, { name: c.title, path: '/majesty-method/acceleration' }]),
      ]} />
    </>
  );
}
