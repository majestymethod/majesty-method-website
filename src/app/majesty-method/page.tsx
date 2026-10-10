import Link from 'next/link';
import { getDoc, getSettings, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { Picture } from '@/components/Picture';
import { ArrowLong, ArrowRight } from '@/components/Icons';
import { pageMetadata } from '@/lib/seo';
import { getMedia } from '@/lib/media';

type Cta = { label: string; href: string };
interface Home {
  hero: { headline: string; body: string; primary: Cta; secondary: Cta; image: ImageRef | null; showMark: boolean };
  philosophy: { title: string; intro: string; principles: { title: string; body: string }[] };
  transformation: { title: string; items: { from: string; to: string }[] };
  paths: { title: string; intro: string; items: { title: string; body: string; ctaLabel: string; href: string }[]; tenderiq: { title: string; body: string; ctaLabel: string } };
  webinars: { title: string; body: string; ctaLabel: string };
  approach: { title: string; intro: string; pillars: { title: string; body: string }[] };
  finalCta: { title: string; body: string; primary: Cta; secondary: Cta };
  seo: { title: string; description: string; image: ImageRef | null };
}

export async function generateMetadata() {
  return pageMetadata(getDoc<Home>('mm_home').seo, '/majesty-method', 'majesty');
}

export default async function MajestyHome() {
  const c = getDoc<Home>('mm_home', await isPreview());
  const s = getSettings();
  const logo = getMedia(s.logo?.id);
  const mark = logo?.variants.find((v) => v.w >= 320) ?? logo?.variants[0];

  return (
    <>
      <section className="mm-hero" aria-labelledby="mm-hero-title">
        <div className="container mm-hero__grid">
          <div>
            <h1 id="mm-hero-title">{c.hero.headline}</h1>
            <p className="lead">{c.hero.body}</p>
            <div className="btn-row">
              {c.hero.primary.label && <Link className="btn" href={c.hero.primary.href}>{c.hero.primary.label}</Link>}
              {c.hero.secondary.label && <Link className="btn btn--secondary" href={c.hero.secondary.href}>{c.hero.secondary.label}</Link>}
            </div>
            <p className="mm-hero__motto"><span className="gold-mark" aria-hidden="true" />{s.motto}</p>
          </div>
          <div className="mm-hero__art" aria-hidden="true">
            <div className="arch">
              <Picture image={c.hero.image} sizes="(max-width: 860px) 300px, 40vw" decorative priority />
              {c.hero.showMark && mark && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="arch__mark" src={`/media/${mark.file}`} alt="" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="philosophy" className="section section--white" aria-labelledby="philosophy-title">
        <div className="container principles">
          <div className="principles__head">
            <h2 id="philosophy-title" className="h2">{c.philosophy.title}</h2>
            <p className="lead">{c.philosophy.intro}</p>
          </div>
          <ul className="principles__list">
            {c.philosophy.principles.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="shift-title">
        <div className="container">
          <div className="section-head">
            <h2 id="shift-title" className="h2">{c.transformation.title}</h2>
          </div>
          <ul className="shift">
            {c.transformation.items.map((t) => (
              <li key={t.from}>
                <span className="shift__from">{t.from}</span>
                <span className="shift__arrow" aria-hidden="true"><ArrowLong /></span>
                <span className="shift__to"><span className="visually-hidden">to </span>{t.to}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="paths" className="section section--white" aria-labelledby="paths-title">
        <div className="container">
          <div className="section-head">
            <h2 id="paths-title" className="h2">{c.paths.title}</h2>
            <p className="lead">{c.paths.intro}</p>
          </div>
          <div className="paths">
            {c.paths.items.map((p) => (
              <article className="path" key={p.title}>
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

      <section className="section section--accent" aria-labelledby="webinars-title">
        <div className="container band">
          <div>
            <h2 id="webinars-title">{c.webinars.title}</h2>
            <p>{c.webinars.body}</p>
          </div>
          <div className="band__actions">
            <Link className="btn btn--light" href="/majesty-method/webinars">{c.webinars.ctaLabel}</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="approach-title">
        <div className="container">
          <div className="section-head">
            <h2 id="approach-title" className="h2">{c.approach.title}</h2>
            <p className="lead">{c.approach.intro}</p>
          </div>
          <div className="pillars">
            {c.approach.pillars.map((p) => (
              <div className="pillar" key={p.title}>
                <div className="rule-gold" aria-hidden="true" />
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream" aria-labelledby="closing-title">
        <div className="container"><div className="closing">
          <h2 id="closing-title">{c.finalCta.title}</h2>
          <p className="lead">{c.finalCta.body}</p>
          <div className="btn-row">
            {c.finalCta.primary.label && <Link className="btn" href={c.finalCta.primary.href}>{c.finalCta.primary.label}</Link>}
            {c.finalCta.secondary.label && <Link className="btn btn--secondary" href={c.finalCta.secondary.href}>{c.finalCta.secondary.label}</Link>}
          </div>
        </div></div>
      </section>
    </>
  );
}
