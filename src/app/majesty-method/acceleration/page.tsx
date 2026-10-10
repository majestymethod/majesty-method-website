import Link from 'next/link';
import { getDoc, getSettings } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { lines } from '@/components/Lines';

interface Acc {
  title: string; headline: string; intro: string; challenge: { title: string; body: string };
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
      <PageHero crumb={{ href: '/majesty-method#paths', label: 'Programmes and services' }} kicker={c.title} title={c.headline} lead={c.intro}>
        <div className="btn-row">
          <Link className="btn" href="#enquire">Book a discovery call</Link>
          <Link className="btn btn--secondary" href="#how">How it works</Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="challenge-title">
        <div className="container split">
          <h2 id="challenge-title" className="h2--sm">{c.challenge.title}</h2>
          <p className="lead" style={{ color: 'var(--ink)' }}>{c.challenge.body}</p>
        </div>
      </section>

      <section className="section section--white" aria-label="What the programme involves">
        <div className="container columns-2">
          <div className="stack">
            <h2 className="h2--sm">What the graduate can help with</h2>
            <ul className="ticks">{lines(c.graduateHelps).map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="note">{c.graduateNote}</p>
          </div>
          <div className="stack">
            <h2 className="h2--sm">What Majesty Method provides</h2>
            <ul className="ticks">{lines(c.provides).map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="how" className="section" aria-labelledby="how-title">
        <div className="container split">
          <div className="stack">
            <h2 id="how-title" className="h2--sm">How the engagement works</h2>
            <p className="muted">{c.termsNote}</p>
          </div>
          <ol className="steps">
            {c.steps.map((s) => (
              <li key={s.title}><div><h3>{s.title}</h3><p>{s.body}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="fit-title">
        <div className="container split">
          <h2 id="fit-title" className="h2--sm">It’s a good fit if</h2>
          <ul className="ticks">{lines(c.suitability).map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </section>

      <section id="enquire" className="section" aria-labelledby="enquire-title">
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

      <ContactStrip title="Not sure this is the right fit?" body="Ask a question first — there’s no obligation." type="Business Acceleration" />
    </>
  );
}
