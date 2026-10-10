import Link from 'next/link';
import { getDoc } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { PageHero, Facts, Faqs } from '@/components/PageHero';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { lines } from '@/components/Lines';

interface Bootcamp {
  title: string; headline: string; intro: string; facts: { label: string; value: string }[]; audience: string;
  problem: { title: string; body: string }; outcomes: { title: string; items: string };
  curriculum: { week: string; title: string; topics: string }[]; whoFor: string; notFor: string;
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
      <PageHero crumb={{ href: '/majesty-method#paths', label: 'Programmes and services' }} kicker={c.title} title={c.headline} lead={c.intro}>
        <div className="btn-row">
          <Link className="btn" href="#register">Register for the Bootcamp</Link>
          <Link className="btn btn--secondary" href="#curriculum">See the curriculum</Link>
        </div>
        <Facts items={c.facts} />
      </PageHero>

      <section className="section" aria-labelledby="problem-title">
        <div className="container split">
          <h2 id="problem-title" className="h2--sm serif">{c.problem.title}</h2>
          <div className="stack">
            <p className="lead" style={{ color: 'var(--ink)' }}>{c.audience}</p>
            <p className="muted">{c.problem.body}</p>
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="outcomes-title">
        <div className="container split">
          <h2 id="outcomes-title" className="h2--sm serif">{c.outcomes.title}</h2>
          <ul className="ticks">{lines(c.outcomes.items).map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
      </section>

      <section id="curriculum" className="section" aria-labelledby="curriculum-title">
        <div className="container">
          <div className="section-head"><h2 id="curriculum-title" className="h2">The four weeks</h2></div>
          <ol className="curriculum">
            {c.curriculum.map((w) => (
              <li key={w.title}>
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

      <section className="section section--white" aria-label="Who the programme is for">
        <div className="container columns-2">
          <div className="stack">
            <h2 className="h2--sm serif">Who should join</h2>
            <ul className="ticks">{lines(c.whoFor).map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
          <div className="stack">
            <h2 className="h2--sm serif">Who it isn’t for</h2>
            <ul className="ticks ticks--x">{lines(c.notFor).map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="register" className="section" aria-labelledby="register-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="register-title" className="h2--sm serif">{c.register.title}</h2>
            <p className="muted">{c.register.body}</p>
          </div>
          <SiteForm formKey="bootcamp" />
        </div>
      </section>

      {c.faqs.length > 0 && (
        <section className="section section--white" aria-labelledby="faq-title">
          <div className="container split">
            <h2 id="faq-title" className="h2--sm serif">Questions</h2>
            <Faqs items={c.faqs} />
          </div>
        </section>
      )}

      <ContactStrip body="Ask us anything about the Founder Bootcamp before you register." type="Founder Bootcamp" />
    </>
  );
}
