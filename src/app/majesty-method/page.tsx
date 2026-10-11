import Link from 'next/link';
import { getDoc, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { Picture } from '@/components/Picture';
import { ArrowRight } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { organizationLd } from '@/lib/structured-data';

type Cta = { label: string; href: string };
interface Home {
  hero: { kicker: string; headline: string; body: string; primary: Cta; secondary: Cta };
  founder: { image: ImageRef | null; caption: string };
  who: { title: string; items: { title: string; body: string }[] };
  philosophy: { title: string; intro: string; principles: { title: string; body: string }[] };
  paths: { title: string; intro: string; pillars: { title: string; body: string }[]; items: { title: string; body: string; ctaLabel: string; href: string }[]; tenderiq: { title: string; body: string; ctaLabel: string } };
  webinars: { title: string; body: string; ctaLabel: string };
  finalCta: { title: string; body: string; primary: Cta; secondary: Cta };
  seo: { title: string; description: string; image: ImageRef | null };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Home>('mm_home').seo, '/majesty-method', 'majesty');
}

export default async function MajestyHome() {
  const c = getDoc<Home>('mm_home', await isPreview());
  const cols = (n: number) => (n % 3 === 0 ? 'grid--3' : n % 4 === 0 ? 'grid--4' : 'grid--2');
  return (
    <>
      <section className="split-hero surface--emerald hero-lit" aria-labelledby="mm-hero-title">
        <div className="container split-hero__grid">
          <div>
            {c.hero.kicker && <p className="kicker">{c.hero.kicker}</p>}
            <h1 id="mm-hero-title" style={{ marginTop: 'var(--s-3)' }}>{c.hero.headline}</h1>
            <p className="lead">{c.hero.body}</p>
            <div className="btn-row">
              {c.hero.primary.label && <Link className="btn" href={c.hero.primary.href}>{c.hero.primary.label}</Link>}
              {c.hero.secondary.label && <Link className="btn btn--secondary" href={c.hero.secondary.href}>{c.hero.secondary.label}</Link>}
            </div>
          </div>
          {c.founder.image && (
            <figure style={{ margin: 0 }}>
              <div className="media media--framed media--portal split-hero__media">
                <Picture image={c.founder.image} sizes="(max-width: 860px) 100vw, 45vw" priority />
              </div>
              {c.founder.caption && <figcaption className="founder-caption">{c.founder.caption}</figcaption>}
            </figure>
          )}
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="who-title">
        <div className="container">
          <div className="section-head"><h2 id="who-title" className="h2">{c.who.title}</h2></div>
          <ul className="who-list">
            {c.who.items.map((w) => (
              <li key={w.title} className="block">
                <span className="card__mark" aria-hidden="true" />
                <strong>{w.title}</strong>
                <span>{w.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="philosophy" className="section surface--onyx" aria-labelledby="philosophy-title">
        <div className="container">
          <div className="section-head">
            <h2 id="philosophy-title" className="h2">{c.philosophy.title}</h2>
            <p className="lead">{c.philosophy.intro}</p>
          </div>
          <ul className={`grid ${cols(c.philosophy.principles.length)}`} style={{ listStyle: 'none' }}>
            {c.philosophy.principles.map((p) => (
              <li key={p.title} className="block card">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="paths" className="section section--tight" aria-labelledby="paths-title">
        <div className="container">
          <div className="section-head">
            <h2 id="paths-title" className="h2">{c.paths.title}</h2>
            <p className="lead">{c.paths.intro}</p>
          </div>
          {c.paths.pillars.length > 0 && (
            <div className="block block--dark block--emerald" style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
              <div className="pillars-inline" style={{ marginBottom: 0 }}>
                {c.paths.pillars.map((p) => (
                  <div key={p.title}><h3>{p.title}</h3><p>{p.body}</p></div>
                ))}
              </div>
            </div>
          )}
          <div className={`grid ${cols(c.paths.items.length)}`}>
            {c.paths.items.map((p) => (
              <article className="block card" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <Link className="text-link" href={p.href}>{p.ctaLabel} <ArrowRight /></Link>
              </article>
            ))}
          </div>
          <p className="aside-note">
            <strong>{c.paths.tenderiq.title}</strong>
            <span>{c.paths.tenderiq.body}</span>
            <Link className="text-link" href="/tenderiq">{c.paths.tenderiq.ctaLabel} <ArrowRight /></Link>
          </p>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="webinars-title">
        <div className="container">
          <div className="block block--dark band" style={{ ['--block-c1' as string]: 'var(--turquoise)', ['--block-c2' as string]: 'var(--forest)' }}>
            <div>
              <h2 id="webinars-title">{c.webinars.title}</h2>
              <p>{c.webinars.body}</p>
            </div>
            <Link className="btn btn--light" href="/majesty-method/webinars">{c.webinars.ctaLabel}</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="closing-title">
        <div className="container">
          <div className="closing">
            <div className="rule-gold" aria-hidden="true" />
            <h2 id="closing-title">{c.finalCta.title}</h2>
            <p className="lead">{c.finalCta.body}</p>
            <div className="btn-row" style={{ justifyContent: 'center' }}>
              {c.finalCta.primary.label && <Link className="btn" href={c.finalCta.primary.href}>{c.finalCta.primary.label}</Link>}
              {c.finalCta.secondary.label && <Link className="btn btn--secondary" href={c.finalCta.secondary.href}>{c.finalCta.secondary.label}</Link>}
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={organizationLd()} />
    </>
  );
}
