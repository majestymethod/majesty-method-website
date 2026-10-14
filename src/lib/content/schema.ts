// Content model for every editable page and collection.
// The admin editor is generated from these definitions, so adding a field here
// (with a default) makes it editable without further admin work.

export type FieldType =
  | 'text' | 'textarea' | 'markdown' | 'url' | 'email' | 'image' | 'file'
  | 'boolean' | 'lines' | 'select' | 'datetime' | 'number' | 'list' | 'group';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: string[];
  fields?: FieldDef[]; // for list + group
  itemLabelKey?: string; // list item title in admin
  required?: boolean;
}

export interface DocDef {
  key: string;
  title: string;
  group: 'Site' | 'Majesty Method' | 'TenderIQ' | 'Legal';
  route?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

const seo = (title: string, description: string): FieldDef => ({
  key: 'seo', label: 'Search & sharing', type: 'group',
  help: 'Shown in search results and link previews.',
  fields: [
    { key: 'title', label: 'Page title', type: 'text', help: 'Aim for under 60 characters.' },
    { key: 'description', label: 'Meta description', type: 'textarea', help: 'Aim for 120–160 characters.' },
    { key: 'image', label: 'Share image (optional)', type: 'image' },
  ],
});
void 0; // seo(title, description) args are documentation only; defaults come from seoDefault()
const seoDefault = (title: string, description: string) => ({ title, description, image: null });

const cta = (label: string) => ({ key: label, label, type: 'group' as const, fields: [
  { key: 'label', label: 'Button text', type: 'text' as const },
  { key: 'href', label: 'Link', type: 'text' as const, help: 'A page path such as /contact, an on-page anchor such as #register, or a full URL.' },
] });

const PLACEHOLDER_NOTE = 'Text in [SQUARE BRACKETS] is a placeholder. The dashboard lists every placeholder still published.';

// ---------------------------------------------------------------------------
// Singleton documents
// ---------------------------------------------------------------------------

export const DOCS: DocDef[] = [
  {
    key: 'settings',
    title: 'Business details & site settings',
    group: 'Site',
    fields: [
      { key: 'brandName', label: 'Brand name', type: 'text' },
      { key: 'descriptor', label: 'Descriptor', type: 'text' },
      { key: 'motto', label: 'Motto', type: 'text' },
      { key: 'tagline', label: 'Logo tagline', type: 'text', help: 'Shown under the logo on the entry page.' },
      { key: 'logo', label: 'Majesty Method logo', type: 'image', help: 'Transparent PNG or SVG works best.' },
      { key: 'tenderiqLogo', label: 'TenderIQ logo', type: 'image', help: 'Leave empty to use the TenderIQ wordmark.' },
      { key: 'registeredName', label: 'Registered business name', type: 'text', help: PLACEHOLDER_NOTE },
      { key: 'legalStatus', label: 'Legal status', type: 'text', help: 'e.g. Private company (Pty) Ltd, sole proprietor.' },
      { key: 'registrationNumber', label: 'Company registration number', type: 'text' },
      { key: 'vatNumber', label: 'VAT number (if registered)', type: 'text' },
      { key: 'physicalAddress', label: 'Physical address', type: 'textarea' },
      { key: 'postalAddress', label: 'Postal address (for legal notices)', type: 'textarea' },
      { key: 'location', label: 'City / region shown in footer', type: 'text' },
      { key: 'email', label: 'Main contact email', type: 'email' },
      { key: 'phone', label: 'Main telephone', type: 'text' },
      { key: 'whatsapp', label: 'WhatsApp number (digits only, with country code)', type: 'text', help: 'e.g. 27810411602. Leave empty to hide the WhatsApp link.' },
      { key: 'tenderiqEmail', label: 'TenderIQ contact email', type: 'email' },
      { key: 'informationOfficer', label: 'Information Officer', type: 'group', fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Telephone', type: 'text' },
      ] },
      { key: 'socials', label: 'Social media links', type: 'list', itemLabelKey: 'label', fields: [
        { key: 'label', label: 'Platform name', type: 'text' },
        { key: 'url', label: 'Profile URL', type: 'url' },
      ] },
      { key: 'announcement', label: 'Webinar strip under the menu (Majesty Method pages)', type: 'group', fields: [
        { key: 'enabled', label: 'Show the strip', type: 'boolean' },
        { key: 'text', label: 'Message', type: 'text', help: 'Keep it to one sentence. It scrolls gently on small screens.' },
        { key: 'linkLabel', label: 'Link text', type: 'text' },
        { key: 'href', label: 'Link goes to', type: 'text', help: 'A page on this site, e.g. /majesty-method/webinars' },
      ] },
      { key: 'bookingUrl', label: 'Discovery call booking link', type: 'url', help: 'Calendly or similar. Leave empty and the Acceleration page uses the enquiry form only.' },
      { key: 'marketingConsentWording', label: 'Marketing consent wording (Majesty Method)', type: 'textarea', help: 'Changing this creates a new consent version for records.' },
      { key: 'tenderiqConsentWording', label: 'Marketing consent wording (TenderIQ)', type: 'textarea' },
      { key: 'consentWordingVersion', label: 'Consent wording version', type: 'text', help: 'Increase (e.g. 2026-10-v2) whenever consent wording changes.' },
      { key: 'analytics', label: 'Analytics', type: 'group', help: 'Analytics only loads after a visitor accepts analytics cookies.', fields: [
        { key: 'provider', label: 'Provider', type: 'select', options: ['none', 'ga4'] },
        { key: 'ga4Id', label: 'GA4 measurement ID', type: 'text', help: 'Format G-XXXXXXX.' },
      ] },
      { key: 'cookieConsentVersion', label: 'Cookie consent version', type: 'text', help: 'Change this to ask visitors for cookie consent again.' },
      { key: 'retentionMonths', label: 'Keep form submissions for (months)', type: 'number', help: 'Used by the retention clean-up on the Submissions screen.' },
    ],
    defaults: {
      brandName: 'Majesty Method',
      descriptor: 'AI • Marketing • Brand Strategy',
      motto: 'Maximum value. Minimum unnecessary effort.',
      tagline: 'Strategy. Power. Elevation.',
      logo: { id: 'seed-logo-mark', alt: 'Majesty Method monogram' },
      tenderiqLogo: null,
      registeredName: '[REGISTERED BUSINESS NAME]',
      legalStatus: '[LEGAL STATUS]',
      registrationNumber: '[COMPANY REGISTRATION NUMBER, IF APPLICABLE]',
      vatNumber: '',
      physicalAddress: '[BUSINESS ADDRESS]',
      postalAddress: '[POSTAL ADDRESS FOR LEGAL NOTICES]',
      location: 'Johannesburg, Gauteng',
      email: 'admin@majestymethod.com',
      phone: '+27 81 041 1602',
      whatsapp: '27810411602',
      tenderiqEmail: 'admin@majestymethod.com',
      informationOfficer: { name: '[INFORMATION OFFICER NAME]', email: '[PRIVACY CONTACT EMAIL]', phone: '' },
      socials: [],
      announcement: { enabled: true, text: 'Free webinar every Friday: one practical marketing, AI, sales or growth topic.', linkLabel: 'Click here to register', href: '/majesty-method/webinars' },
      bookingUrl: '',
      marketingConsentWording: 'Send me occasional emails from Majesty Method about webinars, free resources and programmes. I can unsubscribe at any time.',
      tenderiqConsentWording: 'Send me occasional TenderIQ product updates by email. I can unsubscribe at any time.',
      consentWordingVersion: '2026-10-v1',
      analytics: { provider: 'none', ga4Id: '' },
      cookieConsentVersion: '1',
      retentionMonths: 24,
    },
  },


  // -------------------------------------------------------------------------
  {
    key: 'navigation',
    title: 'Navigation menus',
    group: 'Site',
    fields: [
      { key: 'majesty', label: 'Majesty Method menu', type: 'list', itemLabelKey: 'label', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'href', label: 'Link', type: 'text' },
      ] },
      { key: 'majestyCta', label: 'Majesty Method menu button', type: 'group', fields: [
        { key: 'label', label: 'Button text', type: 'text' },
        { key: 'href', label: 'Link', type: 'text' },
      ] },
      { key: 'tenderiq', label: 'TenderIQ menu', type: 'list', itemLabelKey: 'label', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'href', label: 'Link', type: 'text' },
      ] },
      { key: 'tenderiqCta', label: 'TenderIQ menu button', type: 'group', fields: [
        { key: 'label', label: 'Button text', type: 'text' },
        { key: 'href', label: 'Link', type: 'text' },
      ] },
    ],
    defaults: {
      majesty: [
        { label: 'Home', href: '/majesty-method' },
        { label: 'Our philosophy', href: '/majesty-method#philosophy' },
        { label: 'Programmes and services', href: '/majesty-method#paths' },
        { label: 'Resources', href: '/majesty-method/resources' },
        { label: 'Webinars', href: '/majesty-method/webinars' },
        { label: 'Contact', href: '/contact' },
      ],
      majestyCta: { label: 'Explore our programmes', href: '/majesty-method#paths' },
      tenderiq: [
        { label: 'Why TenderIQ', href: '/tenderiq#why' },
        { label: 'How it works', href: '/tenderiq#how-it-works' },
        { label: 'Contact', href: '/contact?brand=tenderiq' },
      ],
      tenderiqCta: { label: 'Register your interest', href: '/tenderiq#register' },
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'entry',
    title: 'Entry page (House of Majesty entrance)',
    group: 'Site',
    route: '/',
    fields: [
      { key: 'headline', label: 'Page heading (read by screen readers and search engines)', type: 'text', help: 'The welcome text, logo and brand signs are part of the entrance artwork itself.' },
      { key: 'cue', label: 'Ribbon prompt (read by screen readers)', type: 'text', help: 'The artwork already shows “Tap to enter” on the doors.' },
      { key: 'choicePrompt', label: 'Heading shown inside, above the two pathways', type: 'text' },
      { key: 'returnLabel', label: 'Button that returns to the entrance', type: 'text' },
      { key: 'majesty', label: 'Majesty Method pathway (left)', type: 'group', fields: [
        { key: 'label', label: 'Name (read by screen readers; the sign is in the artwork)', type: 'text' },
        { key: 'description', label: 'Supporting label (shown on the Enter button)', type: 'text' },
      ] },
      { key: 'tenderiq', label: 'TenderIQ pathway (right)', type: 'group', fields: [
        { key: 'label', label: 'Name (read by screen readers; the sign is in the artwork)', type: 'text' },
        { key: 'description', label: 'Supporting label (shown on the Enter button)', type: 'text' },
      ] },
      seo('', ''),
    ],
    defaults: {
      headline: 'Welcome to Majesty Method',
      cue: 'Tap to enter',
      choicePrompt: 'Choose your path',
      returnLabel: 'Back to the entrance',
      majesty: { label: 'MAJESTY METHOD', description: 'Founders’ Solutions' },
      tenderiq: { label: 'TENDERIQ', description: 'Tender Opportunities & Intelligence' },
      seo: seoDefault('Majesty Method & TenderIQ | Marketing and Tenders, South Africa', 'Majesty Method helps South African founders with marketing strategy, AI implementation and training. TenderIQ helps businesses find and assess tender opportunities.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'mm_home',
    title: 'Majesty Method homepage',
    group: 'Majesty Method',
    route: '/majesty-method',
    fields: [
      { key: 'hero', label: 'Hero', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the headline', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Supporting copy', type: 'textarea' },
        cta('primary'), cta('secondary'),
      ] },
      { key: 'founder', label: 'Founder photograph', type: 'group', fields: [
        { key: 'image', label: 'Photograph', type: 'image' },
        { key: 'caption', label: 'Caption', type: 'text' },
      ] },
      { key: 'who', label: 'Who we help', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Audiences', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Who', type: 'text' },
          { key: 'body', label: 'Short description', type: 'textarea' },
        ] },
      ] },
      { key: 'philosophy', label: 'What we believe', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'principles', label: 'Principles', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Principle', type: 'text' },
          { key: 'body', label: 'Explanation', type: 'textarea' },
        ] },
      ] },
      { key: 'paths', label: 'Ways to work with us', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'pillars', label: 'Teach / Build / Strategise', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
        ] },
        { key: 'items', label: 'Programmes and services', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
          { key: 'ctaLabel', label: 'Button text', type: 'text' },
          { key: 'href', label: 'Link', type: 'text' },
        ] },
        { key: 'tenderiq', label: 'TenderIQ pointer', type: 'group', fields: [
          { key: 'title', label: 'Heading', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
          { key: 'ctaLabel', label: 'Link text', type: 'text' },
        ] },
      ] },
      { key: 'webinars', label: 'Free Friday webinars', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
        { key: 'ctaLabel', label: 'Button text', type: 'text' },
      ] },
      { key: 'finalCta', label: 'Closing section', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
        cta('primary'), cta('secondary'),
      ] },
      seo('', ''),
    ],
    defaults: {
      hero: {
        kicker: 'Marketing strategy and AI for South African businesses',
        headline: 'Your marketing is too important to be left to chance.',
        body: 'A founder-led approach to understanding your customers, building your strategy, and turning attention into sales.',
        primary: { label: 'Explore our programmes', href: '#paths' },
        secondary: { label: 'Join a free webinar', href: '/majesty-method/webinars' },
      },
      founder: { image: { id: 'seed-founder', alt: 'Adelade Nyarirangwe, founder of Majesty Method' }, caption: 'Majesty Method Founder: Adelade Nyarirangwe' },
      who: {
        title: 'Who we help',
        items: [
          { title: 'Founders doing their own marketing', body: 'You want a clear plan instead of guessing what to post next.' },
          { title: 'Small businesses ready to grow', body: 'You have customers and want a dependable way to find more.' },
          { title: 'Teams adopting AI', body: 'You want practical AI workflows that save time, not more tools.' },
          { title: 'Businesses building in-house capability', body: 'You’d rather develop your own team than outsource everything.' },
        ],
      },
      philosophy: {
        title: 'What we believe',
        intro: 'Marketing is the heartbeat of a business. It deserves strategy, structure and the right tools.',
        principles: [
          { title: 'Strategy before tools', body: 'A clear strategy tells you which platforms and software deserve your time.' },
          { title: 'Customers before content', body: 'Content works when it answers the questions your customers already ask.' },
          { title: 'Every activity has a purpose', body: 'If it can’t be linked to a business goal, question whether it’s worth doing.' },
          { title: 'AI amplifies good thinking', body: 'Use AI to remove repetitive work so your strategy goes further.' },
          { title: 'Systems make it repeatable', body: 'What works once should be documented and repeated, not reinvented.' },
          { title: 'Founders stay in control', body: 'Understand marketing well enough to direct it, even when others do the work.' },
        ],
      },
      paths: {
        title: 'Ways to work with us',
        intro: 'Start where your business is today. Not every business needs every programme.',
        pillars: [
          { title: 'Teach', body: 'Learn the methods so you can make better marketing decisions yourself.' },
          { title: 'Build', body: 'Implement systems, workflows and campaigns inside your business.' },
          { title: 'Strategise', body: 'Decide what to focus on, what to stop and what to build next.' },
        ],
        items: [
          { title: 'Founder Bootcamp', body: 'Four practical weeks of marketing and AI training for entrepreneurs. You learn it, then you build it.', ctaLabel: 'Explore the Bootcamp', href: '/majesty-method/bootcamp' },
          { title: 'Business Acceleration', body: 'Build marketing, sales and AI capacity inside your business with a trained graduate.', ctaLabel: 'Explore Acceleration', href: '/majesty-method/acceleration' },
          { title: 'Courses', body: 'Focused digital marketing training on one skill at a time.', ctaLabel: 'Browse courses', href: '/majesty-method/courses' },
          { title: 'Free resources', body: 'Templates, guides and checklists you can use straight away.', ctaLabel: 'Access free resources', href: '/majesty-method/resources' },
        ],
        tenderiq: { title: 'Looking for tenders?', body: 'TenderIQ is our separate product for finding and assessing tender opportunities.', ctaLabel: 'Visit TenderIQ' },
      },
      webinars: {
        title: 'Free Friday webinars',
        body: 'Each Friday we teach one practical marketing, AI, sales or growth topic. Join a session and get access to free Majesty Method resources.',
        ctaLabel: 'Register for a webinar',
      },
      finalCta: {
        title: 'Not sure where to start?',
        body: 'Tell us where your business is today and we’ll point you to the most useful next step.',
        primary: { label: 'Contact us', href: '/contact' },
        secondary: { label: 'Join a free webinar', href: '/majesty-method/webinars' },
      },
      seo: seoDefault('Marketing Strategy & AI for SA Businesses | Majesty Method', 'Majesty Method helps South African founders build marketing strategy, lead generation and practical AI automation through training, implementation and strategic support.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'bootcamp',
    title: 'Founder Bootcamp',
    group: 'Majesty Method',
    route: '/majesty-method/bootcamp',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'headline', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Short description', type: 'textarea' },
      { key: 'value', label: 'What you’ll be able to do (one per line, keep to 3)', type: 'lines' },
      { key: 'facts', label: 'Programme facts (optional)', type: 'list', itemLabelKey: 'label', help: 'e.g. Duration / Four weeks; Format / Online. Only shown when filled in. Don’t add the price here.', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' },
      ] },
      { key: 'curriculumTitle', label: 'Curriculum heading', type: 'text' },
      { key: 'curriculum', label: 'Curriculum', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'week', label: 'Week label', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'topics', label: 'Topics (one per line)', type: 'lines' },
      ] },
      { key: 'whoForTitle', label: '“Who should join” heading', type: 'text' },
      { key: 'whoFor', label: 'Who should join (one per line)', type: 'lines' },
      { key: 'start', label: 'How to Get Started', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'steps', label: 'Steps', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Step', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
        ] },
      ] },
      { key: 'register', label: 'Registration section', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      { key: 'faqs', label: 'Frequently asked questions', type: 'list', itemLabelKey: 'q', fields: [
        { key: 'q', label: 'Question', type: 'text' },
        { key: 'a', label: 'Answer', type: 'textarea' },
      ] },
      seo('', ''),
    ],
    defaults: {
      image: { id: 'seed-bootcamp', alt: 'A person in a dark suit holding up a newspaper that reads “Think bigger”' },
      headline: 'Founder Bootcamp: marketing and AI training for entrepreneurs',
      intro: 'Four practical weeks. Each week you learn one part of a working marketing system, then build it in your own business.',
      value: 'Understand your customers and what makes them buy\nCreate content and outreach that bring in enquiries\nUse AI and simple systems to save time every week',
      facts: [{ label: 'Duration', value: 'Four weeks' }],
      curriculumTitle: 'What the four weeks cover',
      curriculum: [
        { week: 'Week 1', title: 'Know your market', topics: 'Customer research and segmentation\nCompetitor analysis\nCustomer questions, objections and buying behaviour' },
        { week: 'Week 2', title: 'Content that converts', topics: 'Content strategy\nMessaging and positioning\nTurning attention into enquiries' },
        { week: 'Week 3', title: 'Outreach, leads and paid ads', topics: 'Practical outreach\nLead generation\nWhen paid advertising makes sense' },
        { week: 'Week 4', title: 'AI, funnels and systems', topics: 'Useful AI workflows\nMarketing automation and simple funnels\nRepeatable marketing processes' },
      ],
      whoForTitle: 'Who should join',
      whoFor: 'Founders and small-business owners ready to implement each week\nBusinesses that want more qualified enquiries\nOwners who want to understand marketing well enough to direct it\nTeams who want to use AI practically',
      start: {
        title: 'How to Get Started',
        steps: [
          { title: 'Complete the registration form', body: 'Register your interest through the form on this page.' },
          { title: 'Attend the free Friday webinar', body: 'Learn about the programme, its value and how it works.' },
          { title: 'Complete payment and join', body: 'Once you’ve received the programme details and payment instructions, complete payment to join.' },
        ],
      },
      register: {
        title: 'Register for the Bootcamp',
        body: 'Complete the form and we’ll share the details of the next free Friday webinar. Registering doesn’t commit you to pay or confirm a place.',
      },
      faqs: [
        { q: 'Do I need marketing experience?', a: 'No. The programme starts with fundamentals. You do need to apply each week’s work to your own business.' },
        { q: 'How much time will it take each week?', a: 'Plan time each week to put what you learn into practice. The schedule is shared at the webinar.' },
        { q: 'Can someone from my team join?', a: 'Yes. If an employee handles your marketing, include their email address when you register.' },
        { q: 'What happens after I register?', a: 'You’ll receive the details of the next free Friday webinar, where we explain the programme and the next steps.' },
      ],
      seo: seoDefault('Marketing & AI Training for Entrepreneurs | Founder Bootcamp', 'A four-week, hands-on marketing and AI training programme for South African entrepreneurs: customer research, content, lead generation and AI workflows.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'webinars_page',
    title: 'Webinars page',
    group: 'Majesty Method',
    route: '/majesty-method/webinars',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'value', label: 'What you get (one per line)', type: 'lines' },
      { key: 'resourcesNote', label: 'Free resources note', type: 'textarea' },
      { key: 'emptyTitle', label: 'No sessions scheduled — heading', type: 'text' },
      { key: 'emptyBody', label: 'No sessions scheduled — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      image: { id: 'seed-webinars', alt: 'A smiling woman in a cream dress seated in a studio' },
      title: 'Free Friday webinars on marketing and AI',
      intro: 'One practical topic each Friday, taught so you can apply it the following week.',
      value: 'Practical methods you can use straight away\nTime for questions from founders\nAccess to free Majesty Method resources',
      resourcesNote: 'Everyone who joins a webinar gets access to free Majesty Method digital resources.',
      emptyTitle: 'The next sessions are being scheduled',
      emptyBody: 'Leave your details and we’ll let you know when registration opens.',
      seo: seoDefault('Free Marketing & AI Webinars for Founders | Majesty Method', 'Free Friday webinars on practical marketing, AI, sales and business growth for South African founders, with access to free Majesty Method resources.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'acceleration',
    title: 'Business Acceleration Programme',
    group: 'Majesty Method',
    route: '/majesty-method/acceleration',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'title', label: 'Programme name', type: 'text' },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'intro', label: 'Explanation', type: 'textarea' },
      { key: 'challenge', label: 'The business challenge (dark green block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      { key: 'graduateHelps', label: 'What the graduate can help with (one per line)', type: 'lines' },
      { key: 'graduateNote', label: 'Note about the graduate’s experience level', type: 'textarea' },
      { key: 'provides', label: 'What Majesty Method provides (one per line)', type: 'lines' },
      { key: 'steps', label: 'How the engagement works', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'title', label: 'Step', type: 'text' },
        { key: 'body', label: 'Description', type: 'textarea' },
      ] },
      { key: 'suitability', label: 'Suitability criteria (one per line)', type: 'lines' },
      { key: 'termsNote', label: 'Commercial terms note', type: 'textarea' },
      { key: 'enquiry', label: 'Enquiry section', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      seo('', ''),
    ],
    defaults: {
      image: { id: 'seed-acceleration', alt: 'A team working through marketing strategy documents around a table' },
      title: 'Business Acceleration Programme',
      headline: 'Build marketing, sales and AI capacity inside your business',
      intro: 'Bring a graduate into your team as a developing marketing, sales and AI resource, supported by hands-on training and implementation from Majesty Method. Your business builds capability, and a South African graduate gains valuable work experience.',
      challenge: {
        title: 'The challenge',
        body: 'Many growing businesses need more marketing and sales support but aren’t ready for a senior hire or an ongoing agency retainer. The work falls back on the founder, or it doesn’t get done.',
      },
      graduateHelps: 'Day-to-day marketing and content\nSales and lead-generation support\nUseful AI workflows and automation\nBasic data and performance reporting\nDocumenting and improving processes',
      graduateNote: 'A graduate is an early-career team member, not a senior marketer. The programme develops their skills alongside your business.',
      provides: 'Hands-on training in practical marketing, sales and AI skills\nSupport to apply that training in your business\nA structured approach to building your marketing function',
      steps: [
        { title: 'Discovery call', body: 'We learn about your business, your goals and how marketing works today.' },
        { title: 'Assess fit', body: 'We confirm whether the programme suits your needs and explain how it works commercially.' },
        { title: 'Agree the engagement', body: 'Scope, responsibilities and terms are set out in writing before anything starts.' },
        { title: 'Train and implement', body: 'The graduate is trained and starts applying the work in your business.' },
      ],
      suitability: 'You sell a product or service and want more consistent marketing and sales\nSomeone can supervise and support a graduate day to day\nYou can give the graduate the information and tools they need\nYou want to build capability in-house over time',
      termsNote: 'Placements depend on suitability and availability. Costs and terms are confirmed in writing before you commit.',
      enquiry: {
        title: 'Book a discovery call',
        body: 'Tell us a little about your business. We’ll get back to you to arrange a call.',
      },
      seo: seoDefault('Marketing Support & AI Automation for Small Businesses | Majesty Method', 'Build in-house marketing, sales and AI capability with a trained graduate and hands-on support from Majesty Method. For small businesses in South Africa.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'courses_page',
    title: 'Courses page',
    group: 'Majesty Method',
    route: '/majesty-method/courses',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'emptyTitle', label: 'No courses — heading', type: 'text' },
      { key: 'emptyBody', label: 'No courses — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      image: { id: 'seed-courses', alt: 'A phone screen showing a folder of social media apps' },
      title: 'Digital marketing and AI courses',
      intro: 'Focused learning on one marketing, sales or AI skill at a time.',
      emptyTitle: 'New courses are in preparation',
      emptyBody: 'In the meantime, join a free Friday webinar or put one of our free resources to work.',
      seo: seoDefault('Digital Marketing Training Courses | Majesty Method', 'Focused digital marketing, sales and AI courses for South African founders and their teams.'),
    },
  },

  {
    key: 'resources_page',
    title: 'Free resources page',
    group: 'Majesty Method',
    route: '/majesty-method/resources',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'emptyTitle', label: 'No resources — heading', type: 'text' },
      { key: 'emptyBody', label: 'No resources — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      image: { id: 'seed-resources', alt: 'A hand holding a phone with letter tiles spelling “Break the internet”' },
      title: 'Free marketing and AI resources',
      intro: 'Templates, guides and checklists from Majesty Method, free to use in your business.',
      emptyTitle: 'Resources are being prepared',
      emptyBody: 'Join a Friday webinar to get access as soon as they’re available.',
      seo: seoDefault('Free Marketing & AI Templates and Guides | Majesty Method', 'Free marketing, lead generation and AI templates, guides and checklists for small businesses in South Africa.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'tenderiq',
    title: 'TenderIQ homepage',
    group: 'TenderIQ',
    route: '/tenderiq',
    fields: [
      { key: 'hero', label: 'Hero', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the headline', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Supporting copy', type: 'textarea' },
        cta('primary'), cta('secondary'),
      ] },
      { key: 'problem', label: 'The problem (purple blocks)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'items', label: 'Frustrations (one per line; seven fill the grid best)', type: 'lines' },
      ] },
      { key: 'outcomes', label: 'What TenderIQ is designed to help you do (charcoal blocks)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Outcomes (seven fill the grid best)', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
        ] },
      ] },
      { key: 'industries', label: 'Industry photographs', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'items', label: 'Industries (three)', type: 'list', itemLabelKey: 'label', fields: [
          { key: 'label', label: 'Industry', type: 'text' },
          { key: 'description', label: 'Short description', type: 'text' },
          { key: 'image', label: 'Photograph', type: 'image', help: 'Until a photo is chosen, a labelled placeholder is shown.' },
        ] },
        { key: 'note', label: 'Note under the photographs', type: 'text' },
      ] },
      { key: 'example', label: 'Illustrative example', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'disclaimer', label: 'Disclaimer (purple block)', type: 'text' },
        { key: 'steps', label: 'Story (one step per line)', type: 'lines' },
      ] },
      { key: 'how', label: 'How it works', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'steps', label: 'Steps', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Step', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
        ] },
      ] },
      { key: 'trust', label: 'What TenderIQ does and doesn’t do (purple block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Statements (one per line)', type: 'lines' },
      ] },
      { key: 'faqs', label: 'Frequently asked questions', type: 'list', itemLabelKey: 'q', fields: [
        { key: 'q', label: 'Question', type: 'text' },
        { key: 'a', label: 'Answer', type: 'textarea' },
      ] },
      { key: 'register', label: 'Registration section', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      seo('', ''),
    ],
    defaults: {
      hero: {
        kicker: 'Tender opportunities for South African businesses',
        headline: 'Stop searching blindly. Start pursuing tenders that fit.',
        body: 'TenderIQ is designed to help businesses find relevant tender opportunities, understand what each one requires, and decide which tenders are worth pursuing.',
        primary: { label: 'Register your interest', href: '#register' },
        secondary: { label: 'See how it works', href: '#how-it-works' },
      },
      problem: {
        title: 'Tendering takes more time than it should',
        intro: 'Hours can disappear into a tender document before you find a requirement you can’t meet.',
        items: 'Suitable opportunities are found too late to respond properly\nLong documents have to be reviewed manually, one by one\nMandatory requirements are easy to miss in the detail\nMissing documents surface days before the deadline\nSubmissions are prepared under unnecessary time pressure\nOpportunities outside your usual province go unnoticed\nTime goes into screening instead of preparing a stronger bid',
      },
      outcomes: {
        title: 'What TenderIQ is designed to help you do',
        items: [
          { title: 'Find more relevant opportunities', body: 'Focus on tenders closer to your capabilities, business profile and eligibility.' },
          { title: 'Screen opportunities earlier', body: 'Identify key qualification requirements before committing time to a full submission.' },
          { title: 'Understand what is required', body: 'See the relevant requirements in a structured, readable format.' },
          { title: 'Identify what is missing', body: 'Compare what a tender asks for with the documents and capabilities you have.' },
          { title: 'Prepare with more time', body: 'Find suitable opportunities early enough to plan the work without a last-minute rush.' },
          { title: 'Spend less time screening', body: 'Spend less time reading lengthy documents that turn out not to fit.' },
          { title: 'Focus on stronger submissions', body: 'Put your effort into the opportunities worth pursuing, and submit on time.' },
        ],
      },
      industries: {
        title: 'Built for businesses that tender across sectors',
        intro: 'From construction to supply and delivery, many kinds of South African businesses pursue tenders.',
        items: [
          { label: 'Construction and infrastructure', description: 'Building, civil works and maintenance', image: null },
          { label: 'Supply and delivery', description: 'Equipment, materials and business supplies', image: null },
          { label: 'Logistics and commercial services', description: 'Transport, operations and facility services', image: null },
        ],
        note: 'Photographs show example sectors. They don’t depict TenderIQ customers or tender projects.',
      },
      example: {
        title: 'A tender in another province',
        disclaimer: 'An illustrative scenario — not a customer story, and not a guarantee of results.',
        steps: 'A Gauteng electrical contractor usually only looks at tenders close to home.\nAn opportunity in Limpopo matches their services and capacity — one they would normally have missed.\nThey check the mandatory requirements early and see that two compliance documents need updating.\nWith weeks rather than days to spare, they update the documents and plan the logistics of working out of province.\nThey decide to bid, then prepare and submit through the issuer’s official process — without a last-minute rush.',
      },
      how: {
        title: 'How it works',
        steps: [
          { title: 'Discover', body: 'Find a potential tender.' },
          { title: 'Assess', body: 'Compare the opportunity with your business profile.' },
          { title: 'Review', body: 'Check eligibility and mandatory requirements.' },
          { title: 'Identify gaps', body: 'See which documents and requirements need attention.' },
          { title: 'Decide', body: 'Choose whether to pursue the opportunity.' },
          { title: 'Prepare and submit', body: 'Complete your submission through the official process.' },
        ],
      },
      trust: {
        title: 'What TenderIQ does — and doesn’t — do',
        items: 'TenderIQ supports finding and assessing opportunities. It does not replace the issuer’s official tender documents.\nYou remain responsible for checking every requirement in the official documentation and submitting through the prescribed channel.\nTenderIQ cannot guarantee that you will qualify for, or be awarded, any tender, or that every available tender will be found.',
      },
      faqs: [
        { q: 'Does TenderIQ guarantee that I’ll win a tender?', a: 'No. TenderIQ is designed to help you find and assess opportunities. Whether you qualify and win depends on the tender, your submission and the issuer’s evaluation.' },
        { q: 'Does TenderIQ replace the official tender documents?', a: 'No. Always read the issuer’s official documents. Requirements vary from tender to tender, and the official documents take precedence.' },
        { q: 'How do I know if my business qualifies for a tender?', a: 'Check the mandatory requirements in the official tender documents. These often include registration and compliance documents, and sometimes an industry grading, but they differ for every tender. TenderIQ is designed to help you spot these requirements earlier.' },
        { q: 'Who is TenderIQ for?', a: 'South African businesses that pursue, or want to start pursuing, public and private tender opportunities.' },
      ],
      register: {
        title: 'Register your interest',
        body: 'Tell us about your business and how you tender today. The TenderIQ team will contact you about next steps.',
      },
      seo: seoDefault('TenderIQ | Find Tender Opportunities in South Africa', 'TenderIQ helps South African businesses find relevant tender opportunities, check eligibility requirements early, and decide which tenders are worth pursuing.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'contact_page',
    title: 'Contact page',
    group: 'Site',
    route: '/contact',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      title: 'Contact us',
      intro: 'Ask a question, find out which programme suits your business, or reach the TenderIQ team. Choose an enquiry type so your message reaches the right person.',
      seo: seoDefault('Contact Majesty Method & TenderIQ', 'Contact Majesty Method about marketing programmes, webinars and resources, or reach the TenderIQ team. Based in Johannesburg, working across South Africa.'),
    },
  },

  // Legal pages are added below.
];

import { LEGAL_DOCS } from './legal-defaults';
DOCS.push(...LEGAL_DOCS);

export const DOC_MAP: Record<string, DocDef> = Object.fromEntries(DOCS.map((d) => [d.key, d]));

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export interface CollectionDef {
  key: 'webinars' | 'courses' | 'resources';
  title: string;
  singular: string;
  itemLabelKey: string;
  fields: FieldDef[];
  blank: Record<string, unknown>;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'webinars', title: 'Webinars', singular: 'webinar', itemLabelKey: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'topic', label: 'Topic', type: 'select', options: ['Marketing', 'AI', 'Sales', 'Business growth', 'Other'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'startsAt', label: 'Date and start time (South African time)', type: 'datetime', required: true },
      { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number' },
      { key: 'delivery', label: 'Delivery method', type: 'text', help: 'e.g. Online via Zoom' },
      { key: 'registrationMode', label: 'Registration', type: 'select', options: ['internal', 'external'], help: 'internal = this website’s form; external = link to another registration page.' },
      { key: 'registrationUrl', label: 'External registration URL', type: 'url' },
      { key: 'meetingInstructions', label: 'Joining instructions', type: 'textarea', help: 'Shown to people after they register on this website. Include the meeting link only if you are happy for anyone who registers to see it.' },
      { key: 'recordingUrl', label: 'Recording link (after the session)', type: 'url' },
    ],
    blank: { title: '', topic: 'Marketing', description: '', startsAt: '', durationMinutes: 60, delivery: 'Online', registrationMode: 'internal', registrationUrl: '', meetingInstructions: '', recordingUrl: '' },
  },
  {
    key: 'courses', title: 'Courses', singular: 'course', itemLabelKey: 'title',
    fields: [
      { key: 'title', label: 'Course title', type: 'text', required: true },
      { key: 'summary', label: 'Short description', type: 'textarea' },
      { key: 'audience', label: 'Who it’s for', type: 'textarea' },
      { key: 'outcomes', label: 'Learning outcomes (one per line)', type: 'lines' },
      { key: 'topics', label: 'Topics covered (one per line)', type: 'lines' },
      { key: 'format', label: 'Delivery format', type: 'text' },
      { key: 'duration', label: 'Duration (leave empty until confirmed)', type: 'text' },
      { key: 'price', label: 'Price (leave empty until confirmed)', type: 'text', help: 'Include VAT treatment, e.g. “R1 500 (incl. VAT)”.' },
      { key: 'image', label: 'Course image', type: 'image' },
      { key: 'ctaLabel', label: 'Button text', type: 'text' },
      { key: 'ctaUrl', label: 'Button link', type: 'text', help: 'Registration or purchase page. Leave empty to send people to the contact form.' },
    ],
    blank: { title: '', summary: '', audience: '', outcomes: '', topics: '', format: '', duration: '', price: '', image: null, ctaLabel: 'Register interest', ctaUrl: '' },
  },
  {
    key: 'resources', title: 'Free resources', singular: 'resource', itemLabelKey: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Resource type', type: 'select', options: ['Template', 'Guide', 'Checklist', 'Worksheet', 'PDF', 'AI workflow guide', 'Tool', 'Other'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'thumbnail', label: 'Cover image (optional)', type: 'image' },
      { key: 'file', label: 'File to download', type: 'file', help: 'Stored privately and only served through the website, never at a guessable public address.' },
      { key: 'externalUrl', label: 'Or: link to an external resource', type: 'url', help: 'Used when no file is uploaded. External links cannot be protected by registration.' },
      { key: 'requiresRegistration', label: 'Ask for name and email before download', type: 'boolean' },
    ],
    blank: { title: '', type: 'Guide', description: '', thumbnail: null, file: null, externalUrl: '', requiresRegistration: true },
  },
];
export const COLLECTION_MAP = Object.fromEntries(COLLECTIONS.map((c) => [c.key, c])) as Record<string, CollectionDef>;
