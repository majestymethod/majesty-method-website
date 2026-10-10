import Link from 'next/link';
import { DOCS } from '@/lib/content/schema';
import { currentUser } from '@/lib/auth';
import { getDocMeta } from '@/lib/content/store';

export default async function ContentList() {
  const user = await currentUser();
  const groups = ['Majesty Method', 'TenderIQ', 'Site', 'Legal'] as const;
  return (
    <>
      <h1>Pages</h1>
      <p className="adm-sub">Choose a page to edit its text, images, lists and search settings. Webinars, courses and resources are edited from their own sections.</p>
      {groups.map((g) => (
        <section key={g} style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>{g}</h2>
          <table className="adm-table">
            <tbody>
              {DOCS.filter((d) => d.group === g && (d.key !== 'settings' || user?.role === 'owner')).map((d) => {
                const m = getDocMeta(d.key);
                return (
                  <tr key={d.key}>
                    <td><Link href={`/admin/content/${d.key}`}>{d.title}</Link></td>
                    <td className="adm-help">{d.route ?? ''}</td>
                    <td style={{ textAlign: 'right' }}>{m?.hasUnpublished && d.key !== 'settings' ? <span className="pill pill--draft">Unpublished changes</span> : <span className="pill pill--ok">Published</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}
