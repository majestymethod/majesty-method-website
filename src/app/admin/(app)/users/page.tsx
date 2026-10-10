import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { Users } from '@/components/admin/Misc';
export default async function Page() {
  if ((await currentUser())?.role !== 'owner') redirect('/admin');
  return <Users />;
}
