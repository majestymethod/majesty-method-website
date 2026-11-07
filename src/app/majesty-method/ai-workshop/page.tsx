import Link from 'next/link';
import { SiteForm } from '@/components/forms/SiteForm';
import { WorkshopPayment } from '@/components/forms/WorkshopPayment';
import { ContactStrip } from '@/components/ContactStrip';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return pageMetadata(
    { title: 'AI for Business Workshop', description: 'Learn to use AI practically in your business. A hands-on workshop for founders and teams. R250.' },
    '/majesty-method/ai-workshop',
    'majesty',
  );
}

export default function AiWorkshopPage() {
  return (
    <>
      <section className="split-hero surface--emerald hero-lit" aria-labelledby="workshop-title">
        <div className="container" style={{ paddingBlock: 'clamp(48px, 8vw, 80px)', maxWidth: '640px' }}>
          <h1 id="workshop-title" style={{ fontSize: 'var(--t-2xl)' }}>AI for Business Workshop</h1>
          <p className="lead">Learn to use AI practically in your business.</p>
          <div className="btn-row" style={{ marginTop: 'var(--s-5)' }}>
            <Link className="btn" href="#register">Register now — R250</Link>
          </div>
        </div>
      </section>

      <section id="register" className="section surface--emerald workshop-register" aria-labelledby="register-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h2 id="register-title" className="h2--sm">Register for the workshop</h2>
            <p className="muted">Fill in your details below to register. After registering, you'll receive banking details to complete your R250 payment and secure your seat.</p>
          </div>
          <div>
            <SiteForm formKey="workshop" />
            <div className="workshop-payment-wrap">
              <WorkshopPayment />
            </div>
          </div>
        </div>
      </section>

      <ContactStrip body="Have questions about the AI for Business Workshop? Get in touch." type="General enquiry" />
    </>
  );
}
