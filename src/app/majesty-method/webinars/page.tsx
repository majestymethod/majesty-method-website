import { getDoc, listItems } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { MediaHero } from '@/components/MediaHero';
import type { ImageRef } from '@/lib/content/store';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import Link from 'next/link';
import { Prose, num } from '@/components/Prose';
import { formatSast, parseSast } from '@/lib/dates';

type Block = { title: string; body: string };
interface Page {
  image: ImageRef | null; kicker: string; title: string; tagline: string; intro: string;
  problem: Block; topicsTitle: string; topics: Block[]; audience: Block; closing: Block;
  resourcesNote: string; emptyTitle: string; emptyBody: string; seo: { title: string; description: string };
}
interface Webinar { title: string; topic: string; description: string; startsAt: string; durationMinutes: number; delivery: string; registrationMode: 'internal' | 'external'; registrationUrl: string; recordingUrl: string }

export async function generateMetadata() {
  return pageMetadata(getDoc<Page>('webinars_page').seo, '/majesty-method/webinars', 'majesty');
}

export default async function WebinarsPage() {
  const preview = await isPreview();
  const c = getDoc<Page>('webinars_page', preview);
  const nowMs = Date.now();
  const all = listItems<Webinar>('webinars', { includeDrafts: preview })
    .map((w) => ({ ...w, start: parseSast(w.data.startsAt) }))
    .filter((w) => w.start);
  const upcoming = all.filter((w) => w.start!.getTime() + (w.data.durationMinutes || 60) * 60_000 > nowMs).sort((a, b) => a.start!.getTime() - b.start!.getTime());
  const past = all.filter((w) => !upcoming.includes(w) && w.data.recordingUrl).sort((a, b) => b.start!.getTime() - a.start!.getTime()).slice(0, 6);

  return (
    <>
      <MediaHero crumb={{ href: '/majesty-method', label: 'Majesty Method' }} kicker={c.kicker} title={c.title} lead={c.tagline} image={c.image}>
        {c.intro && <p className="hero-question">{c.intro}</p>}
        <div className="btn-row" style={{ marginTop: 'var(--s-6)' }}>
          <Link className="btn" href="#upcoming">Register for a session</Link>
          <Link className="btn btn--secondary" href="#explore">What we’ll explore</Link>
        </div>
      </MediaHero>

      {c.problem.body && (
        <section className="section section--tight" aria-labelledby="why-title">
          <div className="container split-copy">
            <div className="split-copy__head"><span className="rule-gold" aria-hidden="true" /><h2 id="why-title" className="h2">{c.problem.title}</h2></div>
            <Prose text={c.problem.body} className="prose--lead" />
          </div>
        </section>
      )}

      {c.topics.length > 0 && (
        <section id="explore" className="section surface--onyx" aria-labelledby="explore-title">
          <div className="container">
            <div className="section-head"><h2 id="explore-title" className="h2">{c.topicsTitle}</h2></div>
            <ol className="numbered numbered--3">
              {c.topics.map((t, i) => (
                <li key={t.title} className="block">
                  <span className="numbered__n" aria-hidden="true">{num(i)}</span>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section id="upcoming" className="section section--tight" aria-labelledby="upcoming-title">
        <div className="container">
          <div className="section-head">
            <h2 id="upcoming-title" className="h2">Upcoming sessions</h2>
            <p className="note note--plain">{c.resourcesNote}</p>
          </div>

          {upcoming.length === 0 ? (
            <div className="form-section">
              <div className="empty">
                <h3 style={{ fontSize: 'var(--t-xl)' }}>{c.emptyTitle}</h3>
                <p>{c.emptyBody}</p>
              </div>
              <SiteForm formKey="webinar" submitLabel="Notify me" />
            </div>
          ) : (
            <ul className="listing">
              {upcoming.map((w) => {
                const f = formatSast(w.start!);
                return (
                  <li key={w.id} id={`webinar-${w.id}`} className="block">
                    <div>
                      <p className="listing__meta">
                        {f.date} · {f.time}{w.data.durationMinutes ? ` · ${w.data.durationMinutes} min` : ''}{w.status === 'draft' ? ' · DRAFT (preview only)' : ''}
                      </p>
                      <h3>{w.data.title}</h3>
                      <p className="listing__body">{w.data.description}</p>
                      <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 'var(--s-3)' }}>
                        {[w.data.topic, w.data.delivery].filter(Boolean).join(' · ')}
                      </p>
                      {w.data.registrationMode === 'internal' && (
                        <details>
                          <summary>Register for this session</summary>
                          <div style={{ marginTop: 'var(--s-4)', maxWidth: 640 }}>
                            <SiteForm formKey="webinar" context={{ webinarId: w.id }} compact />
                          </div>
                        </details>
                      )}
                    </div>
                    <div className="listing__aside">
                      {w.data.registrationMode === 'external' && w.data.registrationUrl && (
                        <a className="btn" href={w.data.registrationUrl} rel="noopener noreferrer" target="_blank">
                          Register<span className="visually-hidden"> for {w.data.title} (opens registration on another website)</span>
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {c.audience.body && (
        <section className="section section--tight" aria-labelledby="audience-title">
          <div className="container">
            <div className="block block--dark block--emerald feature-block">
              <span className="rule-gold" aria-hidden="true" />
              <h2 id="audience-title" className="h2--sm">{c.audience.title}</h2>
              <Prose text={c.audience.body} />
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
            <div className="btn-row" style={{ justifyContent: 'center' }}><Link className="btn" href="#upcoming">Register for a session</Link></div>
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="section section--tight" aria-labelledby="past-title">
          <div className="container">
            <div className="section-head"><h2 id="past-title" className="h2--sm">Recordings</h2></div>
            <ul className="listing">
              {past.map((w) => (
                <li key={w.id} className="block">
                  <div>
                    <p className="listing__meta">{formatSast(w.start!).date}</p>
                    <h3>{w.data.title}</h3>
                  </div>
                  <div className="listing__aside">
                    <a className="btn btn--secondary" href={w.data.recordingUrl} rel="noopener noreferrer" target="_blank">Watch recording<span className="visually-hidden"> (opens in a new tab)</span></a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactStrip title="Questions about the sessions?" body="Suggest a topic or ask about upcoming sessions." type="Webinars" />
    </>
  );
}
