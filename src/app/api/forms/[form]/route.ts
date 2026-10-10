import { handleSubmission } from '@/lib/forms/submit';

export async function POST(req: Request, { params }: { params: Promise<{ form: string }> }) {
  const { form } = await params;
  return handleSubmission(req, form);
}
