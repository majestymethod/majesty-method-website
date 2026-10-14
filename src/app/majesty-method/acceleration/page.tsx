import Link from 'next/link';
import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { Picture } from '@/components/Picture';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { JsonLd } from '@/components/JsonLd';
import { lines } from '@/components/Lines';
import { Prose, num } from '@/components/Prose';
import { breadcrumbLd, serviceLd } from '@/lib/structured-data';

type Block = { title: string; body: string };
interface Acc {
  image: ImageRef | null; title: string; headline: string; intro: string; challenge: Block; offer: Block;
  capabilitiesTitle: string; capabilities: Block[]; graduateNote: string; whyInternal: Block;
  outcome: Block & { closingLine: string }; steps: Block[];
  suitability: string; termsNote: string; enquiry: Block; seo: { title: string; description: string };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Acc>('acceleration').seo, '/majesty-method/acceleration', 'majesty');
}

export default async function AccelerationPage() {
  const c = getDoc<Acc>('acceleration', await isPreview());
  const booking = getSettings().bookingUrl;
  return (
    <>
      <section className="split-hero hero-marble" aria-labelledby="acc-title">
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
            <div className="media media--framed split-hero__media split-hero__media--land">
              <Picture image={c.image} sizes="(max-width: 860px) 100vw, 45vw" priority />
            </div>
          )}
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="challenge-title">
        <div className="container">
          <div className="block block--dark block--emerald feature-block">
            <span className="rule-gold" aria-hidden="true" />
            <h2 id="challenge-title" className="h2--sm">{c.challenge.title}</h2>
            <Prose text={c.challenge.body} />
          </div>
        </div>
      </section>

      {c.offer.body && (
        <section className="section section--tight" aria-labelledby="offer-title">
          <div className="container split-copy">
            <div className="split-copy__head"><span className="rule-gold" aria-hidden="true" /><h2 id="offer-title" className="h2">{c.offer.title}</h2></div>
            <Prose text={c.offer.body} className="prose--lead" />
          </div>
        </section>
      )}

      {c.capabilities.length > 0 && (
        <section className="section section--tight" aria-labelledby="caps-title">
          <div className="container">
            <div className="section-head"><h2 id="caps-title" className="h2">{c.capabilitiesTitle}</h2></div>
            <ol className="numbered numbered--3">
              {c.capabilities.map((m, i) => (
                <li key={m.title} className="block card">
                  <span className="numbered__n" aria-hidden="true">{num(i)}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </li>
              ))}
            </ol>
            {c.graduateNote && <p className="aside-note">{c.graduateNote}</p>}
          </div>
        </section>
      )}

      {c.whyInternal.body && (
        <section className="section surface--onyx" aria-labelledby="internal-title">
          <div className="container">
            <div className="feature-block feature-block--wide">
              <span className="rule-gold" aria-hidden="true" />
              <h2 id="internal-title" className="h2">{c.whyInternal.title}</h2>
              <Prose text={c.whyInternal.body} className="prose--lead prose--cols" />
            </div>
          </div>
        </section>
      )}

      {c.outcome.body && (
        <section className="section section--tight" aria-labelledby="outcome-title">
          <div className="container split-copy">
            <div className="split-copy__head"><span className="rule-gold" aria-hidden="true" /><h2 id="outcome-title" className="h2">{c.outcome.title}</h2></div>
            <div>
              <Prose text={c.outcome.body} className="prose--lead" />
              {c.outcome.closingLine && <p className="pull-line">{c.outcome.closingLine}</p>}
            </div>
          </div>
        </section>
      )}

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

      <section id="enquire" className="section surface--emerald" aria-labelledby="enquire-title">
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

      <ContactStrip title="Not sure this is the right fit?" body="Ask a question first. There’s no obligation." type="Team Acceleration" />
      <JsonLd data={[
        serviceLd(c.title, '/majesty-method/acceleration', c.intro, 'Marketing support and AI implementation for small businesses'),
        breadcrumbLd([{ name: 'Majesty Method', path: '/majesty-method' }, { name: c.title, path: '/majesty-method/acceleration' }]),
      ]} />
    </>
  );
}
