import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  return (
    <div className="adm">
      <AdminNav user={user} />
      <main className="adm-main" id="main">{children}</main>
    </div>
  );
}
