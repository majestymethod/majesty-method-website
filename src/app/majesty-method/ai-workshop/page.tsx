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
      <section id="register" className="section surface--emerald workshop-register" aria-labelledby="workshop-title">
        <div className="container form-section">
          <div className="form-section__intro">
            <h1 id="workshop-title" className="h2--sm">AI for Business Workshop</h1>
            <p className="lead" style={{ fontSize: 'var(--t-base)', color: 'rgba(244,240,232,0.85)' }}>Learn to use AI practically in your business.</p>
            <p className="muted">Fill in your details below to register. After registering, you&apos;ll receive banking details to complete your R250 payment and secure your seat.</p>
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
