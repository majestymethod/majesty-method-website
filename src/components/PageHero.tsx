import Link from 'next/link';

export function PageHero({ crumb, kicker, title, lead, children }: { crumb?: { href: string; label: string }; kicker?: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="page-hero hero-marble">
      <div className="container">
        {crumb && <p className="crumb"><Link href={crumb.href}>{crumb.label}</Link></p>}
        {kicker && <p className="page-hero__title">{kicker}</p>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function Facts({ items }: { items: { label: string; value: string }[] }) {
  const shown = items.filter((f) => f.label && f.value);
  if (!shown.length) return null;
  return (
    <dl className="facts">
      {shown.map((f) => (
        <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
      ))}
    </dl>
  );
}

export function Faqs({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.filter((f) => f.q).map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <div><p style={{ whiteSpace: 'pre-line' }}>{f.a}</p></div>
        </details>
      ))}
    </div>
  );
}
