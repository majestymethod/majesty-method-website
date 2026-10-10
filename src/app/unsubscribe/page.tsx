import type { Metadata } from 'next';
import { BrandShell } from '@/components/BrandShell';
import { unsubscribeToken, safeEqual } from '@/lib/security';

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false } };

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const email = (sp.e || '').toLowerCase();
  const valid = !!email && !!sp.t && safeEqual(unsubscribeToken(email), sp.t);
  return (
    <BrandShell brand="majesty">
      <section className="section">
        <div className="container narrow stack">
          <h1 style={{ fontSize: 'var(--t-2xl)' }}>Email preferences</h1>
          {sp.done === '1' ? (
            <p className="alert alert--success" role="status">You’ve been unsubscribed from marketing emails. You may still receive messages about a programme or request you’re part of.</p>
          ) : valid ? (
            <>
              <p className="lead">Stop receiving marketing emails at <strong>{email}</strong>?</p>
              <form method="post" action="/api/unsubscribe">
                <input type="hidden" name="e" value={email} />
                <input type="hidden" name="t" value={sp.t} />
                <button className="btn" type="submit">Unsubscribe</button>
              </form>
            </>
          ) : (
            <p className="lead">This unsubscribe link isn’t valid. To stop marketing emails, reply to any email from us or use the <a href="/contact?type=privacy">contact form</a>.</p>
          )}
        </div>
      </section>
    </BrandShell>
  );
}
