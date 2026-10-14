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
  hero: { headline: string; tagline: string; taglineEmphasis: string; primary: Cta; secondary: Cta };
  who: { title: string; image: ImageRef | null; items: { title: string; body: string }[] };
  philosophy: { title: string; intro: string; principles: { title: string; body: string }[] };
  paths: { title: string; intro: string; pillars: { title: string; body: string }[]; items: { title: string; body: string; ctaLabel: string; href: string }[]; tenderiq: { title: string; body: string; ctaLabel: string } };
  webinars: { title: string; image: ImageRef | null; body: string; ctaLabel: string };
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
      <section className="mm-hero" aria-labelledby="mm-hero-title">
        <div className="container">
          <div className="mm-banner">
            <h1 id="mm-hero-title" className="visually-hidden">{c.hero.headline}</h1>
            <span className="mm-banner__arc" aria-hidden="true" />
            <svg className="mm-banner__chevrons" viewBox="-151 1119 302 101" aria-hidden="true" focusable="false">
              <path fill="none" stroke="#fffaf0" strokeWidth="2.9" d="M-150 1121.7l37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6M-150 1158.1l37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6M-150 1194.5l37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6 37.6 22.6 37.6-22.6" />
            </svg>
            <svg className="mm-banner__slashes" viewBox="2370 1084 324 46" aria-hidden="true" focusable="false">
              <path fill="none" stroke="#fffaf0" strokeWidth="2.9" d="M2371.9 1128l42.5-42.5M2418.1 1128l42.5-42.5M2464.3 1128l42.5-42.5M2510.5 1128l42.5-42.5M2556.7 1128l42.5-42.5M2602.9 1128l42.5-42.5M2649.1 1128l42.5-42.5" />
            </svg>
            <span className="mm-banner__bar" aria-hidden="true" />
            <svg className="mm-banner__phone-lines" viewBox="0 0 810 1012.5" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path fill="#fffaf0" d="M 42.34375 889.289062 L 41.75 888.695312 L 53.898438 876.550781 L 54.492188 877.144531 Z M 41.296875 877.144531 L 40.703125 876.550781 L 28.558594 888.695312 L 29.152344 889.289062 Z M 28.105469 877.144531 L 27.511719 876.550781 L 15.363281 888.695312 L 15.957031 889.289062 Z M 14.910156 877.144531 L 14.316406 876.550781 L 2.171875 888.695312 L 2.761719 889.289062 Z M 1.714844 877.144531 L 1.105469 876.546875 L -11.039062 888.691406 L -10.449219 889.285156 Z M 67.699219 877.144531 L 67.109375 876.550781 L 54.960938 888.695312 L 55.554688 889.289062 Z M -11.480469 877.144531 L -12.085938 876.546875 L -24.234375 888.691406 L -23.640625 889.285156 Z M 54.503906 858.296875 L 53.898438 857.6875 L 41.753906 869.835938 L 42.347656 870.425781 Z M 41.308594 858.296875 L 40.703125 857.6875 L 28.558594 869.835938 L 29.152344 870.425781 Z M 28.117188 858.296875 L 27.507812 857.6875 L 15.359375 869.835938 L 15.953125 870.425781 Z M 14.921875 858.296875 L 14.3125 857.6875 L 2.152344 869.835938 L 2.746094 870.425781 Z M 1.730469 858.296875 L 1.105469 857.6875 L -11.039062 869.835938 L -10.449219 870.425781 Z M 67.714844 858.296875 L 67.097656 857.6875 L 54.953125 869.835938 L 55.542969 870.425781 Z M -11.46875 858.296875 L -12.085938 857.6875 L -24.234375 869.835938 L -23.640625 870.425781 Z M -11.46875 858.296875 " />
              <path fill="#fffaf0" d="M 40.6875 944.441406 L 40.097656 943.847656 L 52.242188 931.699219 L 52.835938 932.292969 Z M 39.640625 932.292969 L 39.050781 931.699219 L 26.902344 943.847656 L 27.496094 944.441406 Z M 26.449219 932.292969 L 25.855469 931.699219 L 13.710938 943.847656 L 14.300781 944.441406 Z M 13.253906 932.292969 L 12.660156 931.699219 L 0.515625 943.847656 L 1.109375 944.441406 Z M 0.0625 932.292969 L -0.546875 931.695312 L -12.695312 943.84375 L -12.105469 944.4375 Z M 66.046875 932.292969 L 65.453125 931.699219 L 53.304688 943.847656 L 53.898438 944.441406 Z M -13.136719 932.292969 L -13.742188 931.695312 L -25.886719 943.84375 L -25.296875 944.4375 Z M 52.847656 913.445312 L 52.246094 912.839844 L 40.097656 924.984375 L 40.691406 925.574219 Z M 39.652344 913.445312 L 39.050781 912.839844 L 26.902344 924.984375 L 27.496094 925.574219 Z M 26.460938 913.445312 L 25.851562 912.839844 L 13.703125 924.984375 L 14.296875 925.574219 Z M 13.265625 913.445312 L 12.65625 912.839844 L 0.5 924.984375 L 1.089844 925.574219 Z M 0.0742188 913.445312 L -0.546875 912.839844 L -12.695312 924.984375 L -12.105469 925.574219 Z M 66.058594 913.445312 L 65.441406 912.839844 L 53.296875 924.984375 L 53.886719 925.574219 Z M -13.125 913.445312 L -13.742188 912.839844 L -25.886719 924.984375 L -25.296875 925.574219 Z M -13.125 913.445312 " />
            </svg>
            <img className="mm-banner__photo" src="/brand/mm-hero-photo-1086.webp" srcSet="/brand/mm-hero-photo-560.webp 560w, /brand/mm-hero-photo-1086.webp 1086w" sizes="(max-width: 700px) 70vw, 36vw" width={1086} height={1297} alt="Adelade Nyarirangwe, founder of Majesty Method, in an emerald suit on the phone, carrying a stack of folders" fetchPriority="high" />
            <img className="mm-banner__logo" src="/brand/mm-hero-logo-1225.webp" srcSet="/brand/mm-hero-logo-640.webp 640w, /brand/mm-hero-logo-1225.webp 1225w" sizes="(max-width: 700px) 86vw, 52vw" width={1225} height={646} alt="Majesty Method" fetchPriority="high" />
            {(c.hero.tagline || c.hero.taglineEmphasis) && (
              <p className="mm-banner__tag">{c.hero.tagline} {c.hero.taglineEmphasis && <em>{c.hero.taglineEmphasis}</em>}</p>
            )}
          </div>
          <div className="btn-row mm-hero__actions">
            {c.hero.primary.label && <Link className="btn" href={c.hero.primary.href}>{c.hero.primary.label}</Link>}
            {c.hero.secondary.label && <Link className="btn btn--secondary" href={c.hero.secondary.href}>{c.hero.secondary.label}</Link>}
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="who-title">
        <div className="container">
          <div className="section-head"><h2 id="who-title" className="h2">{c.who.title}</h2></div>
          <div className={c.who.image ? 'who-wrap who-wrap--photo' : 'who-wrap'}>
          {c.who.image && (
            <div className="media who-wrap__media">
              <Picture image={c.who.image} sizes="(max-width: 860px) 100vw, 34vw" />
            </div>
          )}
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
          <div className={c.webinars.image ? 'block block--dark block--emerald band band--photo' : 'block block--dark block--emerald band'}>
            {c.webinars.image && (
              <div className="band__media">
                <Picture image={c.webinars.image} sizes="(max-width: 760px) 100vw, 240px" />
              </div>
            )}
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
