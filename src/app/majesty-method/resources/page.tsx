import Link from 'next/link';
import { getDoc, listItems, type ImageRef } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { MediaHero } from '@/components/MediaHero';
import { Picture } from '@/components/Picture';
import { SiteForm } from '@/components/forms/SiteForm';
import { ContactStrip } from '@/components/ContactStrip';
import { Download } from '@/components/Icons';
import { getFile } from '@/lib/media';

interface Page { image: ImageRef | null; title: string; intro: string; emptyTitle: string; emptyBody: string; seo: { title: string; description: string } }
interface Resource { title: string; type: string; description: string; thumbnail: ImageRef | null; file: { id: string } | null; externalUrl: string; requiresRegistration: boolean }

const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export async function generateMetadata() {
  return pageMetadata(getDoc<Page>('resources_page').seo, '/majesty-method/resources', 'majesty');
}

export default async function ResourcesPage() {
  const preview = await isPreview();
  const c = getDoc<Page>('resources_page', preview);
  const items = listItems<Resource>('resources', { includeDrafts: preview }).filter((r) => r.data.file || r.data.externalUrl);
  const withMedia = items.some((r) => r.data.thumbnail);
  return (
    <>
      <MediaHero crumb={{ href: '/majesty-method', label: 'Majesty Method' }} title={c.title} lead={c.intro} image={c.image} />
      <section className="section section--tight" aria-label="Resource library">
        <div className="container">
          {items.length === 0 ? (
            <div className="empty block">
              <h2>{c.emptyTitle}</h2>
              <p>{c.emptyBody}</p>
              <p style={{ marginTop: 'var(--s-3)' }}><Link className="btn" href="/majesty-method/webinars">See free webinars</Link></p>
            </div>
          ) : (
            <ul className={`listing${withMedia ? ' listing--with-media' : ''}`}>
              {items.map((r) => {
                const d = r.data;
                const file = getFile(d.file?.id);
                const ext = file ? file.original_name.split('.').pop()?.toUpperCase() : null;
                return (
                  <li key={r.id} id={r.id} className="block">
                    {withMedia && (d.thumbnail ? <Picture image={d.thumbnail} className="listing__media" sizes="(max-width: 760px) 100vw, 168px" /> : <span className="listing__media" aria-hidden="true" />)}
                    <div>
                      <p className="listing__meta">{d.type}{file ? ` · ${ext} · ${fmtSize(file.size)}` : ''}{r.status === 'draft' ? ' · DRAFT (preview only)' : ''}</p>
                      <h2>{d.title}</h2>
                      <p className="listing__body">{d.description}</p>
                      {file && d.requiresRegistration && (
                        <details>
                          <summary>Get this {d.type.toLowerCase()}</summary>
                          <div style={{ marginTop: 'var(--s-4)', maxWidth: 560 }}>
                            <SiteForm formKey="resource" context={{ resourceId: r.id }} compact />
                          </div>
                        </details>
                      )}
                    </div>
                    <div className="listing__aside">
                      {file && !d.requiresRegistration && (
                        <a className="btn" href={`/api/resources/${r.id}/download`}><Download /> Download<span className="visually-hidden"> {d.title}</span></a>
                      )}
                      {!file && d.externalUrl && (
                        <a className="btn" href={d.externalUrl} target="_blank" rel="noopener noreferrer">Open<span className="visually-hidden"> {d.title} (opens in a new tab)</span></a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
      <ContactStrip title="Need help using a resource?" body="Ask us how to apply it in your business." type="Digital resources" />
    </>
  );
}
