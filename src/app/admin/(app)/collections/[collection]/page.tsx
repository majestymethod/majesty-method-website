import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COLLECTION_MAP } from '@/lib/content/schema';
import { listItems } from '@/lib/content/store';

const routes: Record<string, string> = { webinars: '/majesty-method/webinars', courses: '/majesty-method/courses', resources: '/majesty-method/resources' };

export default async function CollectionList({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = COLLECTION_MAP[collection];
  if (!def) notFound();
  const items = listItems<Record<string, unknown>>(collection, { includeDrafts: true });
  return (
    <>
      <h1>{def.title}</h1>
      <p className="adm-sub">
        Only items marked <strong>Published</strong> appear on <a href={routes[collection]} target="_blank" rel="noopener">{routes[collection]}</a>. Drafts are visible to you in preview only. Lower sort numbers appear first{collection === 'webinars' ? ' (webinars are always listed by date)' : ''}.
      </p>
      <div className="adm-bar">
        <Link className="adm-btn" href={`/admin/collections/${collection}/new`}>Add {def.singular}</Link>
        <a className="adm-btn adm-btn--2" href={`/api/admin/preview?to=${routes[collection]}`} target="_blank" rel="noopener">Preview page with drafts</a>
      </div>
      {items.length === 0 ? <p>No {def.title.toLowerCase()} yet.</p> : (
        <table className="adm-table">
          <thead><tr><th>Title</th>{collection === 'webinars' && <th>Date</th>}<th>Status</th><th>Sort</th><th>Updated</th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td><Link href={`/admin/collections/${collection}/${it.id}`}>{String(it.data[def.itemLabelKey] || '(untitled)')}</Link></td>
                {collection === 'webinars' && <td>{String(it.data.startsAt || '—').replace('T', ' ')}</td>}
                <td>{it.status === 'published' ? <span className="pill pill--ok">Published</span> : <span className="pill pill--draft">Draft</span>}</td>
                <td>{it.sort}</td>
                <td className="adm-help">{new Date(it.updated_at).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
