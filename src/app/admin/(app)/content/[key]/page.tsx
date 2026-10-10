import { DocEditor } from '@/components/admin/DocEditor';
export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  return <DocEditor docKey={(await params).key} />;
}
