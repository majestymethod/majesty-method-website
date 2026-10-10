import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { SubmissionsList } from '@/components/admin/Submissions';
export default async function Page() {
  if ((await currentUser())?.role !== 'owner') redirect('/admin');
  return <SubmissionsList />;
}
