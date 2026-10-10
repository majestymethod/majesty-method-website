import { isPreview } from '@/lib/auth';

export async function PreviewBar() {
  if (!(await isPreview())) return null;
  return (
    <div className="preview-bar" role="status">
      <span>Preview mode: you’re seeing unpublished changes. Visitors still see the published version.</span>
      <a href="/api/admin/preview?off=1">Exit preview</a>
      <a href="/admin/content">Back to editor</a>
    </div>
  );
}
