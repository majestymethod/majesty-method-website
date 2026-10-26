import Link from 'next/link';
import type { Metadata } from 'next';
import { TenderDemo } from '@/components/tenderiq/TenderDemo';
import { ContactStrip } from '@/components/ContactStrip';
import './demo.css';

export const metadata: Metadata = {
  title: { absolute: 'TenderIQ demo | See how it works, step by step' },
  description: 'Walk through TenderIQ with sample data: register your interest, send your company profile, get your first matches in a free week, then track every tender on your dashboard.',
  alternates: { canonical: '/tenderiq/demo' },
  openGraph: { type: 'website', title: 'TenderIQ demo', url: '/tenderiq/demo', siteName: 'TenderIQ', locale: 'en_ZA', images: [{ url: '/og/tenderiq.jpg', width: 1200, height: 630 }] },
};

const STEPS = [
  { n: 1, title: 'Register your interest', body: 'Fill in the short TenderIQ registration form.' },
  { n: 2, title: 'Send your company profile', body: 'You’ll get an email with a more detailed form for your company information and profile.' },
  { n: 3, title: 'You’re set!', body: 'Your free tender matches from eTenders arrive by email, with your own dashboard, your free week and a way to subscribe.' },
  { n: 4, title: 'Subscribe and track', body: 'A longer list of matches by email and on your dashboard, where you track your tenders and applications.' },
];

export default function TenderIqDemo() {
  return (
    <>
      <section className="tiq-hero surface--purple hero-lit" aria-labelledby="demo-title">
        <div className="container">
          <p className="crumb"><Link href="/tenderiq">TenderIQ</Link></p>
          <p className="kicker">Demo</p>
          <h1 id="demo-title" style={{ fontSize: 'var(--t-3xl)', maxWidth: '18ch', marginTop: 'var(--s-3)' }}>Get a feel for TenderIQ, step by step</h1>
          <p className="lead" style={{ maxWidth: '60ch' }}>Follow a sample company from registering its interest to tracking tenders on its dashboard. The emails and dashboards below work: try the buttons.</p>
          <p className="tdemo-sample">Sample data. Every company, person and tender in this demo is made up.</p>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="flow-title">
        <div className="container">
          <h2 id="flow-title" className="visually-hidden">How it works</h2>
          <ol className="tflow">
            {STEPS.map((s) => (
              <li key={s.n}>
                <a href={`#step-${s.n}`} className="tflow__card">
                  <span className="tflow__n">Step {s.n}</span>
                  <strong>{s.title}</strong>
                  <span>{s.body}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="step-1" className="section section--tight tstep" aria-labelledby="step-1-title">
        <div className="container tstep__grid">
          <StepHead n={1} id="step-1-title" title="Register your interest">
            Fill in the short TenderIQ registration form. It takes your contact details and a few questions about your business.
          </StepHead>
          <div className="tstep__cta">
            <Link className="btn" href="/tenderiq#register">Register your interest</Link>
            <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 'var(--s-3)' }}>Opens the registration form on the TenderIQ page.</p>
          </div>
        </div>
      </section>

      <section id="step-2" className="section section--tight tstep" aria-labelledby="step-2-title">
        <div className="container">
          <StepHead n={2} id="step-2-title" title="Send your company profile">
            You’ll receive an email with a more detailed Google Form. Complete it with your company information and upload your company profile, then submit it. This is what TenderIQ matches tenders against.
          </StepHead>
          <WelcomeEmail />
        </div>
      </section>

      <section id="step-3" className="section section--tight tstep" aria-labelledby="step-3-title">
        <div className="container">
          <StepHead n={3} id="step-3-title" title="You’re set!">
            You’ll receive an email with your free tender matches from eTenders, and your own dashboard with your free week and the option to subscribe. Switch between the email and the dashboard below.
          </StepHead>
          <TenderDemo plan="trial" id="demo-trial" />
        </div>
      </section>

      <section id="step-4" className="section section--tight tstep" aria-labelledby="step-4-title">
        <div className="container">
          <StepHead n={4} id="step-4-title" title="Subscribe and track your tenders">
            Once you subscribe, TenderIQ searches more platforms, so you get a longer list of tender results by email and on your dashboard. Keep track of each tender, your applications and the documents you need. Mark a tender in the email, then open the dashboard to see it update.
          </StepHead>
          <TenderDemo plan="sub" id="demo-sub" />
        </div>
      </section>

      <section className="section closing" aria-labelledby="demo-close-title">
        <div className="container narrow" style={{ textAlign: 'center' }}>
          <h2 id="demo-close-title" className="h2">Ready to see your own matches?</h2>
          <p className="lead" style={{ marginInline: 'auto' }}>Start with step 1. It only takes a few minutes.</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link className="btn" href="/tenderiq#register">Register your interest</Link>
            <Link className="btn btn--secondary" href="/tenderiq#pricing">See pricing</Link>
          </div>
        </div>
      </section>

      <ContactStrip title="Questions about TenderIQ?" body="Talk to the TenderIQ team before you join." type="TenderIQ" />
    </>
  );
}

function StepHead({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <div className="tstep__head">
      <span className="tstep__n" aria-hidden="true">{n}</span>
      <div>
        <p className="kicker">Step {n}</p>
        <h2 id={id} className="h2--sm">{title}</h2>
        <p className="tstep__body">{children}</p>
      </div>
    </div>
  );
}

function WelcomeEmail() {
  return (
    <section className="tdemo" aria-label="Sample welcome email">
      <div className="tmail">
        <div className="tmail__head">
          <div className="tmail__subj">Welcome to TenderIQ: tell us about your company</div>
          <div className="tmail__row"><span>From <b>TenderIQ</b></span><span>To <b>Thandi Mokoena, Dube &amp; Mokoena Civil Works</b></span><span>Mon 19 Oct 2026, 09:12</span></div>
        </div>
        <div className="tmail__canvas"><div className="tmail__mail">
          <div className="m-top"><div className="wm">TENDER<span>IQ</span></div><div className="dt">WELCOME</div></div>
          <div className="m-body">
            <h3>Hi Thandi,</h3>
            <p>Thank you for registering your interest in TenderIQ.</p>
            <p>The next step is your company profile. It tells us what your business can deliver, so we can match you to the right tenders and show you what you may be missing for each one.</p>
            <p>Please complete the form below. It asks about:</p>
            <ul className="m-list">
              <li>your services, skills and the work you want</li>
              <li>the provinces you want to work in and your contract value range</li>
              <li>your compliance details, such as CIDB grading, B-BBEE level and tax status</li>
              <li>your team and past projects</li>
            </ul>
            <p>You can also upload your company profile and supporting documents.</p>
            <p style={{ margin: '18px 0' }}><span className="tbtn tbtn--gold" role="img" aria-label="Button: Complete your company profile (sample, not a working link)">Complete your company profile</span></p>
            <p>Once we have your profile, we’ll start your free week and send your first matches.</p>
            <p>The TenderIQ team<br />Majesty Method</p>
          </div>
          <div className="m-foot">Sample email. In the real email, the button opens the TenderIQ company profile form (a Google Form).</div>
        </div></div>
      </div>
    </section>
  );
}
