import { getDoc, listItems } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { MediaHero } from '@/components/MediaHero';
import type { ImageRef } from '@/lib/content/store';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { lines } from '@/components/Lines';
import { formatSast, parseSast } from '@/lib/dates';

interface Page { image: ImageRef | null; title: string; intro: string; value: string; resourcesNote: string; emptyTitle: string; emptyBody: string; seo: { title: string; description: string } }
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
      <MediaHero crumb={{ href: '/majesty-method', label: 'Majesty Method' }} title={c.title} lead={c.intro} image={c.image}>
        <ul className="ticks" style={{ marginTop: 'var(--s-6)' }}>{lines(c.value).map((v) => <li key={v}>{v}</li>)}</ul>
      </MediaHero>

      <section className="section section--tight" aria-labelledby="upcoming-title">
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

      <ContactStrip title="Questions about the webinars?" body="Suggest a topic or ask about upcoming sessions." type="Webinars" />
    </>
  );
}
