import Link from 'next/link';
import type { ImageRef } from '@/lib/content/store';
import { Picture } from './Picture';

/** Two-column page hero: text and an optional photograph. */
export function MediaHero({ crumb, kicker, title, lead, image, children }: { crumb?: { href: string; label: string }; kicker?: string; title: string; lead?: string; image?: ImageRef | null; children?: React.ReactNode }) {
  return (
    <section className="split-hero hero-marble">
      <div className="container split-hero__grid">
        <div>
          {crumb && <p className="crumb"><Link href={crumb.href}>{crumb.label}</Link></p>}
          {kicker && <p className="kicker" style={{ marginBottom: 'var(--s-3)' }}>{kicker}</p>}
          <h1 style={{ fontSize: 'var(--t-2xl)' }}>{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
        {image && (
          <div className="media media--framed split-hero__media split-hero__media--land">
            <Picture image={image} sizes="(max-width: 860px) 100vw, 45vw" priority />
          </div>
        )}
      </div>
    </section>
  );
}
