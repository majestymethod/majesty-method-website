import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getForm } from '@/lib/content/store';
import { DEFAULT_FORMS, type FormKey } from '@/lib/forms/definitions';

const where: Record<FormKey, string> = {
  bootcamp: '/majesty-method/bootcamp', webinar: '/majesty-method/webinars', acceleration: '/majesty-method/acceleration',
  tenderiq: '/tenderiq', contact: '/contact', resource: '/majesty-method/resources',
};

export default async function Forms() {
  if ((await currentUser())?.role !== 'owner') redirect('/admin');
  return (
    <>
      <h1>Forms</h1>
      <p className="adm-sub">Edit questions, answer options, wording, confirmation messages, notifications and Google Sheets mapping. Every submission is stored in the website database first, whatever else is configured.</p>
      <table className="adm-table">
        <thead><tr><th>Form</th><th>Used on</th><th>Questions</th><th>Google Sheets</th></tr></thead>
        <tbody>
          {(Object.keys(DEFAULT_FORMS) as FormKey[]).map((k) => {
            const f = getForm(k);
            return (
              <tr key={k}>
                <td><Link href={`/admin/forms/${k}`}>{f.title}</Link></td>
                <td><a href={where[k]} target="_blank" rel="noopener">{where[k]}</a></td>
                <td>{f.fields.filter((x) => x.enabled).length}</td>
                <td>{f.sheets.enabled ? <span className="pill pill--ok">On</span> : <span className="pill">Off</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
