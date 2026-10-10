import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { FormBuilder } from '@/components/admin/FormBuilder';
export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  if ((await currentUser())?.role !== 'owner') redirect('/admin');
  return <FormBuilder formKey={(await params).key} />;
}
