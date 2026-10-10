import Link from 'next/link';

export function ContactStrip({ title = 'Have a question?', body = 'Ask us anything about this programme. We’ll point you in the right direction.', type, brand }: { title?: string; body?: string; type?: string; brand?: 'tenderiq' }) {
  const q = new URLSearchParams();
  if (type) q.set('type', type);
  if (brand) q.set('brand', brand);
  return (
    <section className="container" aria-labelledby="contact-strip-title">
      <div className="contact-strip">
        <div>
          <h2 id="contact-strip-title">{title}</h2>
          <p>{body}</p>
        </div>
        <Link className="btn btn--secondary" href={`/contact${q.size ? `?${q}` : ''}`}>Contact us</Link>
      </div>
    </section>
  );
}
