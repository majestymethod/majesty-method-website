import Link from 'next/link';
import { getDoc, listItems, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Picture } from '@/components/Picture';
import { ContactStrip } from '@/components/ContactStrip';
import { lines } from '@/components/Lines';

interface Page { title: string; intro: string; emptyTitle: string; emptyBody: string; seo: { title: string; description: string } }
interface Course { title: string; summary: string; audience: string; outcomes: string; topics: string; format: string; duration: string; price: string; image: ImageRef | null; ctaLabel: string; ctaUrl: string }

export async function generateMetadata() {
  return pageMetadata(getDoc<Page>('courses_page').seo, '/majesty-method/courses', 'majesty');
}

export default async function CoursesPage() {
  const preview = await isPreview();
  const c = getDoc<Page>('courses_page', preview);
  const courses = listItems<Course>('courses', { includeDrafts: preview });
  const withMedia = courses.some((x) => x.data.image);
  return (
    <>
      <PageHero crumb={{ href: '/majesty-method#paths', label: 'Programmes and services' }} title={c.title} lead={c.intro} />
      <section className="section" aria-label="Course catalogue">
        <div className="container">
          {courses.length === 0 ? (
            <div className="empty">
              <h2>{c.emptyTitle}</h2>
              <p>{c.emptyBody}</p>
              <div className="btn-row" style={{ marginTop: 'var(--s-3)' }}>
                <Link className="btn" href="/majesty-method/webinars">See free webinars</Link>
                <Link className="btn btn--secondary" href="/majesty-method/resources">Browse free resources</Link>
              </div>
            </div>
          ) : (
            <ul className={`listing${withMedia ? ' listing--with-media' : ''}`}>
              {courses.map((x) => {
                const d = x.data;
                const external = /^https?:\/\//.test(d.ctaUrl);
                const href = d.ctaUrl || `/contact?type=Courses&course=${encodeURIComponent(d.title)}`;
                const outcomes = lines(d.outcomes), topics = lines(d.topics);
                return (
                  <li key={x.id}>
                    {withMedia && (d.image ? <Picture image={d.image} className="listing__media" sizes="(max-width: 760px) 100vw, 168px" /> : <span className="listing__media" aria-hidden="true" />)}
                    <div>
                      <p className="listing__meta">{[d.format, d.duration].filter(Boolean).join(' · ')}{x.status === 'draft' ? ' · DRAFT (preview only)' : ''}</p>
                      <h2 className="serif" style={{ fontSize: 'var(--t-xl)', fontWeight: 500 }}>{d.title}</h2>
                      <p className="listing__body">{d.summary}</p>
                      {(d.audience || outcomes.length > 0 || topics.length > 0) && (
                        <details>
                          <summary>Course details</summary>
                          <div className="detail-grid">
                            {d.audience && <div><h4>Who it’s for</h4><p className="muted">{d.audience}</p></div>}
                            {outcomes.length > 0 && <div><h4>You’ll be able to</h4><ul className="ticks">{outcomes.map((o) => <li key={o}>{o}</li>)}</ul></div>}
                            {topics.length > 0 && <div><h4>Topics</h4><ul className="ticks">{topics.map((o) => <li key={o}>{o}</li>)}</ul></div>}
                          </div>
                        </details>
                      )}
                    </div>
                    <div className="listing__aside">
                      {d.price && <p className="listing__price">{d.price}</p>}
                      <a className="btn" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {d.ctaLabel || 'Register interest'}<span className="visually-hidden">: {d.title}{external ? ' (opens in a new tab)' : ''}</span>
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
      <ContactStrip title="Looking for something specific?" body="Tell us what you’d like to learn. It helps us decide which courses to build next." type="Courses" />
    </>
  );
}
