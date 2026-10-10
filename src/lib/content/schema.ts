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
    title: 'Entry page',
    group: 'Site',
    route: '/',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'supporting', label: 'Supporting line', type: 'textarea' },
      { key: 'heroImage', label: 'Hero image', type: 'image', help: 'Full-width, at least 2000px wide. Keep the left side calm so the headline stays readable.' },
      { key: 'choicePrompt', label: 'Choice prompt', type: 'text' },
      { key: 'majesty', label: 'Majesty Method destination', type: 'group', fields: [
        { key: 'label', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ] },
      { key: 'tenderiq', label: 'TenderIQ destination', type: 'group', fields: [
        { key: 'label', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ] },
      seo('', ''),
    ],
    defaults: {
      headline: 'Strategy that moves business forward.',
      supporting: 'Marketing, technology and intelligent systems for businesses ready to operate with greater clarity.',
      heroImage: { id: 'seed-hero-entry', alt: '' },
      choicePrompt: 'Choose where you’d like to go',
      majesty: { label: 'Majesty Method', description: 'Marketing, strategy, AI and business growth for founders.' },
      tenderiq: { label: 'TenderIQ', description: 'Find tender opportunities worth pursuing.' },
      seo: seoDefault('Majesty Method & TenderIQ', 'Majesty Method helps founders build marketing strategy, systems and AI capability. TenderIQ helps businesses find and assess tender opportunities.'),
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
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Supporting copy', type: 'textarea' },
        cta('primary'), cta('secondary'),
        { key: 'image', label: 'Arch image', type: 'image', help: 'Shown inside the arch beside the headline. A calm texture works best; the logo sits on top.' },
        { key: 'showMark', label: 'Show the logo on the arch image', type: 'boolean' },
      ] },
      { key: 'philosophy', label: 'Our philosophy', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'principles', label: 'Principles', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Principle', type: 'text' },
          { key: 'body', label: 'Explanation', type: 'textarea' },
        ] },
      ] },
      { key: 'transformation', label: 'The transformation', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'From → to', type: 'list', itemLabelKey: 'from', fields: [
          { key: 'from', label: 'From', type: 'text' },
          { key: 'to', label: 'To', type: 'text' },
        ] },
      ] },
      { key: 'paths', label: 'Choose your path', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'items', label: 'Services', type: 'list', itemLabelKey: 'title', fields: [
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
      { key: 'approach', label: 'Teach. Build. Strategise.', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'pillars', label: 'Pillars', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
        ] },
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
        headline: 'Marketing should move your business forward.',
        body: 'We help founders build the strategy, systems and practical marketing capabilities their businesses need to attract customers, convert demand and grow with greater intention.',
        primary: { label: 'Explore our programmes', href: '#paths' },
        secondary: { label: 'Discover our philosophy', href: '#philosophy' },
        image: { id: 'seed-hero-entry', alt: '' },
        showMark: true,
      },
      philosophy: {
        title: 'What we believe',
        intro: 'Most businesses don’t need more marketing activity. They need marketing that is connected to how the business actually makes money.',
        principles: [
          { title: 'Marketing is the heartbeat of a business', body: 'It is how customers find you, understand you and decide to buy. It deserves the attention of any other core business function.' },
          { title: 'Strategy comes before tools', body: 'Platforms and software change every year. A clear strategy tells you which ones deserve your time.' },
          { title: 'Customer understanding comes before content', body: 'Content works when it answers the questions your customers are already asking.' },
          { title: 'Every activity should serve an objective', body: 'If a post, campaign or tool can’t be connected to a business goal, question whether it is worth doing.' },
          { title: 'AI should reduce effort and amplify strategy', body: 'Used well, AI removes repetitive work so good thinking goes further. Used without strategy, it produces more noise, faster.' },
          { title: 'Systems make good work repeatable', body: 'What works once should be documented, simplified and repeated — not reinvented every week.' },
          { title: 'Founders should make informed decisions', body: 'You don’t have to do all the marketing yourself. You should understand it well enough to direct it.' },
        ],
      },
      transformation: {
        title: 'From activity to a marketing system',
        items: [
          { from: 'Random activity', to: 'Strategic execution' },
          { from: 'Vanity metrics', to: 'Commercially useful insight' },
          { from: 'Manual repetition', to: 'Intelligent workflows' },
          { from: 'Blind outsourcing', to: 'Informed collaboration' },
          { from: 'Disconnected tasks', to: 'A functioning marketing system' },
        ],
      },
      paths: {
        title: 'Choose your path',
        intro: 'Start where your business is today. Not every business needs every programme.',
        items: [
          { title: 'Founder Bootcamp', body: 'Four practical weeks to understand your customers, create content that converts, generate leads and set up simple marketing systems. You learn it, then you build it.', ctaLabel: 'Explore the Bootcamp', href: '/majesty-method/bootcamp' },
          { title: 'Business Acceleration Programme', body: 'Build marketing, sales and AI capacity inside your business by bringing in a graduate, supported by hands-on training and implementation.', ctaLabel: 'Explore Acceleration', href: '/majesty-method/acceleration' },
          { title: 'Courses and learning', body: 'Focused learning on specific marketing, sales and AI skills, for when you need depth on one topic.', ctaLabel: 'Browse courses', href: '/majesty-method/courses' },
          { title: 'Free digital resources', body: 'Templates, guides and checklists you can put to work in your business straight away.', ctaLabel: 'Access free resources', href: '/majesty-method/resources' },
        ],
        tenderiq: { title: 'Looking for tenders?', body: 'TenderIQ is our separate product for finding and assessing tender opportunities.', ctaLabel: 'Visit TenderIQ' },
      },
      webinars: {
        title: 'Free Friday webinars',
        body: 'Each Friday we teach one practical marketing, AI, sales or business growth topic you can apply the following week. Join a session and get access to free Majesty Method resources.',
        ctaLabel: 'Register for a webinar',
      },
      approach: {
        title: 'Teach. Build. Strategise.',
        intro: 'Three ways to work with us, depending on what your business needs right now.',
        pillars: [
          { title: 'Teach', body: 'Learn the principles and methods so you can make better marketing decisions yourself.' },
          { title: 'Build', body: 'Put the work into practice: implement systems, workflows and campaigns inside your business, and develop the people who run them.' },
          { title: 'Strategise', body: 'Get strategic support to decide what to focus on, what to stop, and what to build next.' },
        ],
      },
      finalCta: {
        title: 'Not sure where to start?',
        body: 'Tell us where your business is today and we’ll point you to the most useful next step — even if that’s a free resource.',
        primary: { label: 'Contact us', href: '/contact' },
        secondary: { label: 'Join a free webinar', href: '/majesty-method/webinars' },
      },
      seo: seoDefault('Majesty Method — AI, Marketing & Brand Strategy', 'Majesty Method helps founders build the marketing strategy, systems and AI capability their businesses need to attract customers and grow.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'bootcamp',
    title: 'Founder Bootcamp',
    group: 'Majesty Method',
    route: '/majesty-method/bootcamp',
    fields: [
      { key: 'title', label: 'Programme name', type: 'text' },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'facts', label: 'Programme facts (optional)', type: 'list', itemLabelKey: 'label', help: 'e.g. Duration / Four weeks; Format / Online; Next cohort / 2 February 2027. Only shown when filled in.', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' },
      ] },
      { key: 'audience', label: 'Who it’s for (short)', type: 'textarea' },
      { key: 'problem', label: 'The problem it addresses', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      { key: 'outcomes', label: 'Outcomes', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Outcomes (one per line)', type: 'lines' },
      ] },
      { key: 'curriculum', label: 'Curriculum', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'week', label: 'Week label', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'topics', label: 'Topics (one per line)', type: 'lines' },
      ] },
      { key: 'whoFor', label: 'Who should join (one per line)', type: 'lines' },
      { key: 'notFor', label: 'Who it isn’t for (one per line)', type: 'lines' },
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
      title: 'Founder Bootcamp',
      headline: 'Four weeks to build marketing that works for your business.',
      intro: 'A practical, hands-on programme for founders who want to understand their customers, create content that converts, generate leads and build simple marketing systems. You learn it, then you build it — inside your own business.',
      facts: [{ label: 'Duration', value: 'Four weeks' }],
      audience: 'For founders and small-business owners who do their own marketing, or direct someone who does, and want a clearer, more structured approach.',
      problem: {
        title: 'Busy isn’t the same as effective',
        body: 'Many founders post regularly, try a few ads and experiment with AI tools, yet can’t connect that effort to enquiries and sales. The bootcamp replaces scattered activity with a simple system: know who you’re selling to, say what they need to hear, reach the right people, and make the work repeatable.',
      },
      outcomes: {
        title: 'What you’ll work through',
        items: 'A clear picture of your customers, their questions and their objections\nA content plan built around what your customers need to hear\nA practical approach to outreach and lead generation\nA working understanding of paid advertising and when it makes sense\nAI workflows and simple systems that reduce repetitive work',
      },
      curriculum: [
        { week: 'Week 1', title: 'Know your market', topics: 'Customer intelligence\nCustomer interviews and segmentation\nCompetitor analysis\nUnderstanding customer questions, objections and buying behaviour\nUsing research to make better marketing decisions' },
        { week: 'Week 2', title: 'Content that converts', topics: 'Content strategy\nContent aligned with customer needs\nMessaging and positioning\nTurning attention into meaningful enquiries' },
        { week: 'Week 3', title: 'Outreach, lead generation and paid advertising', topics: 'Practical outreach\nLead generation approaches\nUnderstanding paid advertising\nConnecting acquisition activity to business objectives' },
        { week: 'Week 4', title: 'AI, funnels and marketing systems', topics: 'Useful AI workflows\nMarketing automation\nBasic funnel design\nRepeatable marketing processes\nUsing technology to reduce unnecessary manual work' },
      ],
      whoFor: 'Founders who are ready to implement each week, not just attend\nBusinesses that sell a product or service and want more qualified enquiries\nOwners who want to understand marketing well enough to direct it\nTeams who want to use AI practically, not experimentally',
      notFor: 'Anyone looking for a done-for-you marketing service\nAnyone expecting results without doing the work\nBusinesses that want to hand over their thinking entirely',
      register: {
        title: 'Register for the Bootcamp',
        body: 'Tell us about you and your business. We’ll contact you with cohort dates and next steps.',
      },
      faqs: [
        { q: 'Do I need marketing experience?', a: 'No. The programme starts with fundamentals and builds from there. You do need to be willing to apply each week’s work to your own business.' },
        { q: 'How much time will it take each week?', a: 'Plan time each week to implement what you learn — the programme is built around doing the work. The schedule is shared when you register.' },
        { q: 'Can someone from my team join?', a: 'Yes. If an employee handles your marketing, tell us when you register and include their email address.' },
        { q: 'What does it cost?', a: '[CONFIRM: programme fee and payment terms]' },
      ],
      seo: seoDefault('Founder Bootcamp — Majesty Method', 'A practical four-week programme for founders: customer intelligence, content that converts, lead generation, paid advertising, AI workflows and marketing systems.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'webinars_page',
    title: 'Webinars page',
    group: 'Majesty Method',
    route: '/majesty-method/webinars',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'value', label: 'What you get (one per line)', type: 'lines' },
      { key: 'resourcesNote', label: 'Free resources note', type: 'textarea' },
      { key: 'emptyTitle', label: 'No sessions scheduled — heading', type: 'text' },
      { key: 'emptyBody', label: 'No sessions scheduled — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      title: 'Free Friday webinars',
      intro: 'One practical topic each Friday — marketing, AI, sales or business growth — taught so you can apply it the following week.',
      value: 'Practical methods you can use straight away\nTime for questions from founders\nAccess to free Majesty Method resources when you join',
      resourcesNote: 'Everyone who joins a webinar gets access to free Majesty Method digital resources.',
      emptyTitle: 'The next sessions are being scheduled',
      emptyBody: 'Leave your details and we’ll let you know when registration opens.',
      seo: seoDefault('Free Friday Webinars — Majesty Method', 'Free weekly webinars on practical marketing, AI, sales and business growth for founders, with access to free Majesty Method resources.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'acceleration',
    title: 'Business Acceleration Programme',
    group: 'Majesty Method',
    route: '/majesty-method/acceleration',
    fields: [
      { key: 'title', label: 'Programme name', type: 'text' },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'intro', label: 'Explanation', type: 'textarea' },
      { key: 'challenge', label: 'The business challenge', type: 'group', fields: [
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
      title: 'Business Acceleration Programme',
      headline: 'Build marketing capacity inside your business.',
      intro: 'The Business Acceleration Programme helps you bring a graduate into your team as a developing marketing, sales and AI resource — supported by hands-on training and practical implementation from Majesty Method. Your business builds internal capability, and a South African graduate gains valuable work experience.',
      challenge: {
        title: 'The challenge',
        body: 'Many growing businesses need more marketing and sales capacity but aren’t ready for a senior hire or an ongoing agency retainer. The work falls back on the founder, or it doesn’t get done.',
      },
      graduateHelps: 'Day-to-day marketing activity and content\nSales and lead-generation support\nSetting up useful AI workflows and automation\nBasic data and performance reporting\nDocumenting and improving internal processes\nBuilding a more structured marketing function over time',
      graduateNote: 'A graduate is an early-career team member, not a senior marketer. The programme is designed to develop their skills alongside your business, with training and support from Majesty Method.',
      provides: 'Hands-on training in practical marketing, sales and AI skills\nSupport to apply that training in your business\nA structured approach to building your marketing function',
      steps: [
        { title: 'Discovery call', body: 'We learn about your business, your goals and how marketing works today.' },
        { title: 'Assess fit', body: 'We confirm whether the programme suits your needs and explain how it works commercially.' },
        { title: 'Agree the engagement', body: 'Scope, responsibilities and terms are set out in writing before anything starts.' },
        { title: 'Train and implement', body: 'The graduate is trained and starts applying the work in your business.' },
      ],
      suitability: 'You sell a product or service and want more consistent marketing and sales activity\nSomeone in the business can supervise and support a graduate day to day\nYou can give the graduate access to the information and tools they need\nYou want to build capability in-house over time',
      termsNote: 'Placements depend on suitability and availability. Costs and commercial terms are confirmed in writing before you commit.',
      enquiry: {
        title: 'Book a discovery call',
        body: 'Tell us a little about your business. We’ll get back to you to arrange a call.',
      },
      seo: seoDefault('Business Acceleration Programme — Majesty Method', 'Build in-house marketing, sales and AI capacity by bringing a graduate into your team, supported by hands-on training from Majesty Method.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'courses_page',
    title: 'Courses page',
    group: 'Majesty Method',
    route: '/majesty-method/courses',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'emptyTitle', label: 'No courses — heading', type: 'text' },
      { key: 'emptyBody', label: 'No courses — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      title: 'Courses',
      intro: 'Focused learning on specific marketing, sales and AI skills.',
      emptyTitle: 'New courses are in preparation',
      emptyBody: 'In the meantime, join a free Friday webinar or put one of our free resources to work.',
      seo: seoDefault('Courses — Majesty Method', 'Focused courses on practical marketing, sales and AI skills for founders and their teams.'),
    },
  },

  {
    key: 'resources_page',
    title: 'Free resources page',
    group: 'Majesty Method',
    route: '/majesty-method/resources',
    fields: [
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'emptyTitle', label: 'No resources — heading', type: 'text' },
      { key: 'emptyBody', label: 'No resources — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      title: 'Free resources',
      intro: 'Templates, guides and checklists from Majesty Method, free to use in your business.',
      emptyTitle: 'Resources are being prepared',
      emptyBody: 'Join a Friday webinar to get access as soon as they’re available.',
      seo: seoDefault('Free Resources — Majesty Method', 'Free marketing, AI and business growth templates, guides and checklists from Majesty Method.'),
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
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Supporting copy', type: 'textarea' },
        cta('primary'), cta('secondary'),
      ] },
      { key: 'problem', label: 'The problem', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'textarea' },
        { key: 'items', label: 'Frustrations (one per line)', type: 'lines' },
      ] },
      { key: 'outcomes', label: 'Value proposition', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Outcomes', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
        ] },
      ] },
      { key: 'example', label: 'Illustrative example', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'disclaimer', label: 'Disclaimer', type: 'text' },
        { key: 'steps', label: 'Story (one step per line)', type: 'lines' },
      ] },
      { key: 'how', label: 'How it works', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'steps', label: 'Steps', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Step', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
        ] },
      ] },
      { key: 'trust', label: 'Trust and transparency', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Statements (one per line)', type: 'lines' },
      ] },
      { key: 'register', label: 'Registration section', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      seo('', ''),
    ],
    defaults: {
      hero: {
        headline: 'Stop searching blindly. Start pursuing tenders that fit.',
        body: 'TenderIQ is designed to help businesses identify relevant tender opportunities, understand what each one requires, and make more informed decisions about which tenders are worth pursuing.',
        primary: { label: 'Register your interest', href: '#register' },
        secondary: { label: 'See how it works', href: '#how-it-works' },
      },
      problem: {
        title: 'Tendering takes more time than it should',
        intro: 'Hours can disappear into a tender document before you find a requirement you can’t meet. Meanwhile, other opportunities close.',
        items: 'Suitable opportunities are found too late to respond properly\nLong documents have to be reviewed manually, one by one\nMandatory requirements are easy to miss in the detail\nMissing documents surface days before the deadline\nSubmissions are prepared under unnecessary time pressure\nOpportunities outside your usual province go unnoticed\nTime goes into screening instead of preparing a stronger bid',
      },
      outcomes: {
        title: 'What TenderIQ is designed to help you do',
        items: [
          { title: 'Find more relevant opportunities', body: 'Focus on tenders that are closer to your capabilities, business profile and eligibility.' },
          { title: 'Screen opportunities earlier', body: 'Identify key qualification requirements before committing substantial time to a full submission.' },
          { title: 'Understand what is required', body: 'See the relevant requirements in a structured, readable format.' },
          { title: 'Identify what is missing', body: 'Compare what a tender asks for with the documents and capabilities you have available.' },
          { title: 'Prepare with more time', body: 'Find suitable opportunities early enough to assess them, plan the work and prepare without a last-minute rush.' },
        ],
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
      register: {
        title: 'Register your interest',
        body: 'Tell us about your business and how you tender today. The TenderIQ team will use this to understand your needs and contact you about next steps.',
      },
      seo: seoDefault('TenderIQ — Find tenders worth pursuing', 'TenderIQ helps South African businesses find relevant tender opportunities, understand their requirements early, and decide which tenders are worth pursuing.'),
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
      seo: seoDefault('Contact — Majesty Method & TenderIQ', 'Get in touch with Majesty Method about programmes, webinars and resources, or with the TenderIQ team.'),
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
