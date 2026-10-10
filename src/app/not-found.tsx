import Link from 'next/link';
import { BrandShell } from '@/components/BrandShell';

export default function NotFound() {
  return (
    <BrandShell brand="majesty">
      <section className="section">
        <div className="container narrow stack">
          <h1 style={{ fontSize: 'var(--t-2xl)' }}>This page doesn’t exist</h1>
          <p className="lead">The link may be out of date, or the page may have moved.</p>
          <div className="btn-row"><Link className="btn" href="/">Go to the homepage</Link><Link className="btn btn--secondary" href="/contact">Contact us</Link></div>
        </div>
      </section>
    </BrandShell>
  );
}
