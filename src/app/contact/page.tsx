import { getDoc, getForm, getSettings } from '@/lib/content/store';
import { isPreview } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { BrandShell } from '@/components/BrandShell';
import { PageHero } from '@/components/PageHero';
import { SiteForm } from '@/components/forms/SiteForm';

interface Page { title: string; intro: string; seo: { title: string; description: string } }

export async function generateMetadata() {
  return pageMetadata(getDoc<Page>('contact_page').seo, '/contact', 'majesty');
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const brand = sp.brand === 'tenderiq' ? 'tenderiq' : 'majesty';
  const c = getDoc<Page>('contact_page', await isPreview());
  const s = getSettings();
  const options = getForm('contact').fields.find((f) => f.key === 'enquiryType')?.options ?? [];
  const wanted = (sp.type === 'privacy' ? 'Privacy or data request' : sp.type) ?? (brand === 'tenderiq' ? 'TenderIQ' : '');
  const enquiryType = options.find((o) => o.toLowerCase() === wanted.toLowerCase()) ?? '';
  const message = sp.course ? `I’d like to know more about the course “${sp.course.slice(0, 120)}”.` : '';
  const email = brand === 'tenderiq' ? s.tenderiqEmail || s.email : s.email;

  return (
    <BrandShell brand={brand}>
      <PageHero title={c.title} lead={c.intro} />
      <section className="section section--tight">
        <div className="container form-section">
          <div className="form-section__intro block">
            <h2 className="h2--sm">Other ways to reach us</h2>
            <dl className="stack">
              {email && <div><dt className="muted">Email</dt><dd style={{ margin: 0 }}><a href={`mailto:${email}`}>{email}</a></dd></div>}
              {s.phone && <div><dt className="muted">Telephone</dt><dd style={{ margin: 0 }}><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></dd></div>}
              {s.whatsapp && <div><dt className="muted">WhatsApp</dt><dd style={{ margin: 0 }}><a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} rel="noopener noreferrer">Message us on WhatsApp</a></dd></div>}
              {s.location && <div><dt className="muted">Based in</dt><dd style={{ margin: 0 }}>{s.location}</dd></div>}
            </dl>
            <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
              For privacy or data requests, choose “Privacy or data request” as the enquiry type.
            </p>
          </div>
          <SiteForm formKey="contact" initialValues={{ enquiryType, message }} />
        </div>
      </section>
    </BrandShell>
  );
}
