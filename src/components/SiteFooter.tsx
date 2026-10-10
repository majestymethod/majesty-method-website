import Link from 'next/link';
import { getSettings } from '@/lib/content/store';
import { CookieSettingsButton } from './CookieSettingsButton';

const isPlaceholder = (s: string | undefined) => !s || /^\[.*\]$/.test(s.trim());

export function LegalLinks() {
  return (
    <ul>
      <li><Link href="/legal/privacy">Privacy notice</Link></li>
      <li><Link href="/legal/cookies">Cookie policy</Link></li>
      <li><CookieSettingsButton /></li>
      <li><Link href="/legal/terms">Website terms</Link></li>
      <li><Link href="/legal/paia">PAIA information</Link></li>
    </ul>
  );
}

export function SiteFooter({ brand }: { brand: 'majesty' | 'tenderiq' }) {
  const s = getSettings();
  const year = new Date().getFullYear();
  const tiq = brand === 'tenderiq';
  const contactEmail = tiq ? s.tenderiqEmail || s.email : s.email;
  const ioEmail = isPlaceholder(s.informationOfficer.email) ? null : s.informationOfficer.email;
  const ident = [s.registeredName, s.legalStatus, s.registrationNumber ? `Reg. no. ${s.registrationNumber}` : '', s.vatNumber ? `VAT ${s.vatNumber}` : '']
    .filter(Boolean).join(' · ');
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <p style={{ marginTop: 0, color: '#fff', fontFamily: tiq ? 'var(--sans)' : 'var(--serif)', fontSize: '1.375rem', fontWeight: tiq ? 700 : 400 }}>
              {tiq ? 'TenderIQ' : s.brandName}
            </p>
            <p>{tiq ? 'Find and assess tender opportunities with more time to prepare.' : s.descriptor}</p>
            {!tiq && <p className="site-footer__motto">{s.motto}</p>}
          </div>
          <div>
            <h2>{tiq ? 'TenderIQ' : 'Programmes'}</h2>
            {tiq ? (
              <ul>
                <li><Link href="/tenderiq#why">Why TenderIQ</Link></li>
                <li><Link href="/tenderiq#how-it-works">How it works</Link></li>
                <li><Link href="/tenderiq#register">Register your interest</Link></li>
                <li><Link href="/majesty-method">Majesty Method</Link></li>
              </ul>
            ) : (
              <ul>
                <li><Link href="/majesty-method/bootcamp">Founder Bootcamp</Link></li>
                <li><Link href="/majesty-method/acceleration">Business Acceleration</Link></li>
                <li><Link href="/majesty-method/courses">Courses</Link></li>
                <li><Link href="/majesty-method/webinars">Free Friday webinars</Link></li>
                <li><Link href="/majesty-method/resources">Free resources</Link></li>
                <li><Link href="/tenderiq">TenderIQ</Link></li>
              </ul>
            )}
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              {contactEmail && <li><a href={`mailto:${contactEmail}`}>{contactEmail}</a></li>}
              {s.phone && <li><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></li>}
              {s.whatsapp && <li><a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} rel="noopener noreferrer">WhatsApp</a></li>}
              {s.location && <li>{s.location}</li>}
              <li><Link href={tiq ? '/contact?brand=tenderiq' : '/contact'}>Contact form</Link></li>
            </ul>
          </div>
          <div>
            <h2>Your data</h2>
            <ul>
              <li><Link href="/legal/privacy">How we use your information</Link></li>
              <li><Link href="/contact?type=privacy">Privacy or data request</Link></li>
              {ioEmail && <li>Information Officer: <a href={`mailto:${ioEmail}`}>{ioEmail}</a></li>}
              {s.socials.filter((x) => x.url).map((x) => (
                <li key={x.url}><a href={x.url} rel="noopener noreferrer">{x.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-footer__legal">
          <LegalLinks />
          <p>© {year} {isPlaceholder(s.registeredName) ? s.brandName : s.registeredName}. {ident && !isPlaceholder(s.registeredName) ? ident : ''}</p>
          {!isPlaceholder(s.physicalAddress) && <p>{s.physicalAddress.replace(/\n/g, ', ')}</p>}
        </div>
      </div>
    </footer>
  );
}
