import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { SubmissionDetail } from '@/components/admin/Submissions';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  if ((await currentUser())?.role !== 'owner') redirect('/admin');
  return <SubmissionDetail id={(await params).id} />;
}
