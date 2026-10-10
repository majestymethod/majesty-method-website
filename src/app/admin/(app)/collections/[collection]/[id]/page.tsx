import { ItemEditor } from '@/components/admin/ItemEditor';
export default async function Page({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  return <ItemEditor collection={collection} id={id} />;
}
