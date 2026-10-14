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
      announcement: { enabled: true, text: 'The Founder Marketing Sessions — free, every Friday. Smarter marketing, stronger brands, better business outcomes.', linkLabel: 'Click here to register', href: '/majesty-method/webinars' },
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
        { label: 'Friday Sessions', href: '/majesty-method/webinars' },
        { label: 'Contact', href: '/contact' },
      ],
      majestyCta: { label: 'Explore our programmes', href: '/majesty-method#paths' },
      tenderiq: [
        { label: 'Why TenderIQ', href: '/tenderiq#why' },
        { label: 'How it works', href: '/tenderiq#how-it-works' },
        { label: 'Pricing', href: '/tenderiq#pricing' },
        { label: 'Contact', href: '/contact?brand=tenderiq' },
      ],
      tenderiqCta: { label: 'Join TenderIQ', href: '/tenderiq#register' },
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
      { key: 'hero', label: 'Banner', type: 'group', fields: [
        { key: 'headline', label: 'Page headline (not shown on the banner; read by search engines and screen readers)', type: 'text' },
        { key: 'tagline', label: 'Text on the gold bar', type: 'text' },
        { key: 'taglineEmphasis', label: 'Bold word at the end of the gold bar', type: 'text' },
        cta('primary'), cta('secondary'),
      ] },
      { key: 'who', label: 'Who we help', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'image', label: 'Photograph (beside the list)', type: 'image', help: 'Portrait photos work best. Leave empty to show the list on its own.' },
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
        { key: 'image', label: 'Photograph (left of the block)', type: 'image', help: 'Leave empty to show the block without a photo.' },
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
        headline: 'Majesty Method: marketing strategy and AI for South African businesses',
        tagline: 'The method of',
        taglineEmphasis: 'success',
        primary: { label: 'Explore our programmes', href: '#paths' },
        secondary: { label: 'Join a free webinar', href: '/majesty-method/webinars' },
      },
      who: {
        title: 'Who we help',
        image: { id: 'seed-who', alt: 'A businesswoman in an emerald suit on the phone, juggling a stack of overflowing folders' },
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
          { title: 'Founder Marketing Bootcamp', body: 'Four weeks of guided, practical implementation: build a structured, increasingly automated marketing function around your business.', ctaLabel: 'Explore the Bootcamp', href: '/majesty-method/bootcamp' },
          { title: 'Team Acceleration', body: 'Build an in-house marketing function: a graduate joins your business and we train them over a nine-month programme.', ctaLabel: 'Explore Team Acceleration', href: '/majesty-method/acceleration' },
          { title: 'Courses', body: 'Focused digital marketing training on one skill at a time.', ctaLabel: 'Browse courses', href: '/majesty-method/courses' },
          { title: 'Free resources', body: 'Templates, guides and checklists you can use straight away.', ctaLabel: 'Access free resources', href: '/majesty-method/resources' },
        ],
        tenderiq: { title: 'Looking for tenders?', body: 'TenderIQ is our separate product for finding and assessing tender opportunities.', ctaLabel: 'Visit TenderIQ' },
      },
      webinars: {
        title: 'The Founder Marketing Sessions',
        image: { id: 'seed-webinar-band', alt: 'Someone relaxing with their feet up in red heels, a laptop on their lap' },
        body: 'Free, every Friday. Smarter marketing, stronger brands and better business outcomes — practical sessions on positioning, founder-led marketing, AI automation and turning attention into revenue.',
        ctaLabel: 'Join the next session',
      },
      finalCta: {
        title: 'Not sure where to start?',
        body: 'Tell us where your business is today and we’ll point you to the most useful next step.',
        primary: { label: 'Contact us', href: '/contact' },
        secondary: { label: 'Join a free Friday session', href: '/majesty-method/webinars' },
      },
      seo: seoDefault('Marketing Strategy & AI for SA Businesses | Majesty Method', 'Majesty Method helps South African founders build marketing strategy, lead generation and practical AI automation through training, implementation and strategic support.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'bootcamp',
    title: 'Founder Marketing Bootcamp',
    group: 'Majesty Method',
    route: '/majesty-method/bootcamp',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'headline', label: 'Heading', type: 'text' },
      { key: 'intro', label: 'Short description', type: 'textarea' },
      { key: 'value', label: 'Key points beside the photo (one per line, keep to 3)', type: 'lines' },
      { key: 'facts', label: 'Programme facts (optional)', type: 'list', itemLabelKey: 'label', help: 'e.g. Duration / Four weeks. Only shown when filled in. Don’t add the price here.', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' },
      ] },
      { key: 'problem', label: 'The problem', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'vision', label: 'What becomes possible (dark green block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'modulesTitle', label: '“What you’ll learn” heading', type: 'text' },
      { key: 'modules', label: 'What you’ll learn', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'body', label: 'Description', type: 'textarea' },
      ] },
      { key: 'modulesNote', label: 'Note under the list', type: 'textarea' },
      { key: 'audience', label: 'Who it’s for', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'format', label: 'How the programme works (onyx block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'start', label: 'How to Get Started', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'steps', label: 'Steps', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Step', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
        ] },
      ] },
      { key: 'closing', label: 'Closing message', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
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
      headline: 'The Founder Marketing Bootcamp',
      intro: 'A practical marketing programme for founders who need their marketing to work — without becoming full-time marketers themselves.',
      value: 'Four weeks of guided, hands-on implementation in your own business\nMarketing strategy, practical skills and accessible AI tools\nSystems that keep your marketing moving when you get busy',
      facts: [{ label: 'Duration', value: 'Four weeks' }],
      problem: {
        title: 'Your business can’t afford for marketing to stop every time you get busy',
        body: 'You’re managing customers, operations, finances and decisions. Somewhere in between, you’re also expected to create content, answer enquiries, generate leads, follow up with prospects and keep your brand visible.\n\nHiring a full marketing team isn’t always practical. Spending hours every day trying to keep up isn’t sustainable either.\n\nThe Founder Marketing Bootcamp is designed for exactly this reality. Over four weeks, you’ll build a more structured, consistent and increasingly automated marketing function around your business — combining practical skills, strategic thinking and accessible AI tools to get more from the time and resources you already have.\n\nThe goal isn’t to hand you another list of things to do. It’s to rethink how those things get done.',
      },
      vision: {
        title: 'More customers. More leads. More consistency. Less unnecessary work.',
        body: 'Imagine running a paid advertising campaign without personally answering every enquiry as it arrives. A system captures each lead, asks the right qualifying questions, organises the answers and shows you who is ready for a conversation. You set aside one focused session for your qualified prospects, while automated follow-ups keep everyone else moving through your pipeline.\n\nNow apply the same principle to your content, customer communication, email outreach and other repetitive marketing work.\n\nThat’s the marketing infrastructure you’ll learn to build — not by hiring an expensive team or buying complicated software, but by understanding the strategy behind your marketing and using practical tools, including AI and automation, to make your effort go further.',
      },
      modulesTitle: 'What you’ll learn',
      modules: [
        { title: 'Understand your customers before you market to them', body: 'Identify your ideal customers, understand their motivations and challenges, and segment your audience by need, behaviour and readiness to buy. Use practical research techniques to shape relevant offers and stronger messaging — because reaching more people means little if they’re the wrong people.' },
        { title: 'Create content consistently, without creating content all day', body: 'Build a content strategy that links your business goals to the conversations your audience cares about. Generate ideas, create compelling assets, repurpose what you have and produce content in batches — using AI for research, planning and writing while keeping your brand’s voice.' },
        { title: 'Build a lead generation and qualification system', body: 'Turn attention into an organised pipeline: lead campaigns, enquiry forms, qualifying questions and structured capture, so prospects can easily show interest and you can see which conversations deserve your attention first. Add automated follow-ups and nurturing so fewer promising enquiries slip through the cracks.' },
        { title: 'Use AI assistants for routine marketing tasks', body: 'Use accessible AI tools to draft responses and emails, organise lead information, support prospect research and streamline recurring work, and connect them into simple workflows. The aim isn’t to automate every interaction — it’s to automate what doesn’t need you, so you can give more attention to what does.' },
        { title: 'Host your own lives and webinars', body: 'No large team or studio required. Plan a session around a clear business objective, structure your presentation, promote it, manage the setup and give attendees a clear next step — using live content to demonstrate expertise, answer questions and build trust.' },
        { title: 'Build a marketing system that fits your business', body: 'Connect content, research, lead generation, qualification, follow-up and conversion into one process. Decide what to prioritise, what to systemise, what to automate and what still needs you — and measure what matters, from qualified enquiries and conversion rates to retention and repeat sales.' },
      ],
      modulesNote: 'And there’s more: the programme pairs marketing fundamentals with practical implementation, giving you the foundation to make smarter decisions and to explore more advanced uses of AI, automation and structured workflows in your business.',
      audience: {
        title: 'Designed for the founder who can’t do everything',
        body: 'For business owners who know marketing matters but have limited time for it: the founder still handling marketing personally, the entrepreneur creating content in spare moments, the owner receiving enquiries without a reliable system to manage them.\n\nYou don’t need to be a marketing professional, have a marketing team or master every AI tool. You need a willingness to rethink how your marketing works — and to put practical systems in place.',
      },
      format: {
        title: 'Four weeks. Practical implementation. A smarter way to market.',
        body: 'This isn’t a passive course where you watch videos, collect notes and hope to find time to apply them. It’s a guided implementation programme: you work on your own business, make decisions and put what you learn into practice.\n\nYou’ll develop a sharper understanding of your customers, communicate your value more clearly, build more consistent content and lead generation, and use automation to reduce manual work — leaving with a clear marketing direction and processes you can keep refining as you grow.\n\nBecause your marketing shouldn’t depend on how much free time you happen to have that week.',
      },
      start: {
        title: 'How to Get Started',
        steps: [
          { title: 'Complete the registration form', body: 'Register your interest through the form on this page.' },
          { title: 'Attend the free Friday session', body: 'Learn about the programme, its value and how it works.' },
          { title: 'Complete payment and join', body: 'Once you’ve received the programme details and payment instructions, complete payment to join.' },
        ],
      },
      closing: {
        title: 'Your business needs marketing. It doesn’t need you doing everything manually.',
        body: 'You started your business to build something valuable — not to spend every hour switching between jobs to keep everything alive. Join the Founder Marketing Bootcamp and build a marketing function that works with the realities of running your business, not against them.',
      },
      register: {
        title: 'Register for the Bootcamp',
        body: 'Complete the form and we’ll share the details of the next free Friday session. Registering doesn’t commit you to pay or confirm a place.',
      },
      faqs: [
        { q: 'Do I need marketing experience?', a: 'No. You don’t need to be a marketing professional or have a marketing team. You do need to apply each week’s work to your own business.' },
        { q: 'How much time will it take each week?', a: 'Plan time each week to put what you learn into practice. The schedule is shared at the Friday session.' },
        { q: 'Can someone from my team join?', a: 'Yes. If an employee handles your marketing, include their email address when you register.' },
        { q: 'What happens after I register?', a: 'You’ll receive the details of the next free Friday session, where we explain the programme and the next steps.' },
      ],
      seo: seoDefault('The Founder Marketing Bootcamp | Marketing & AI Training for Founders', 'A four-week, hands-on programme for South African founders: customer research, consistent content, lead generation and qualification, AI assistants and automation.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'webinars_page',
    title: 'The Founder Marketing Sessions (webinars page)',
    group: 'Majesty Method',
    route: '/majesty-method/webinars',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'kicker', label: 'Line above the heading', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'problem', label: 'Why these sessions', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'topicsTitle', label: '“What we’ll explore” heading', type: 'text' },
      { key: 'topics', label: 'What we’ll explore', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'title', label: 'Topic', type: 'text' },
        { key: 'body', label: 'Description', type: 'textarea' },
      ] },
      { key: 'audience', label: 'Who it’s for (dark green block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'closing', label: 'Closing message', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      { key: 'resourcesNote', label: 'Free resources note', type: 'textarea' },
      { key: 'emptyTitle', label: 'No sessions scheduled — heading', type: 'text' },
      { key: 'emptyBody', label: 'No sessions scheduled — text', type: 'textarea' },
      seo('', ''),
    ],
    defaults: {
      image: { id: 'seed-webinars', alt: 'A smiling woman in a cream dress seated in a studio' },
      kicker: 'Free · Every Friday',
      title: 'The Founder Marketing Sessions',
      tagline: 'Smarter marketing. Stronger brands. Better business outcomes.',
      intro: 'What if growing your business didn’t mean spending more on marketing, creating content every day or working twice as hard to be noticed?',
      problem: {
        title: 'More effort isn’t always the answer',
        body: 'Often the problem isn’t that you’re doing too little. It’s that your business isn’t getting enough value from the effort you already put in.\n\nYour marketing may reach people without converting them. Your content may attract attention without building demand. You may offer an excellent product or service and still struggle to explain why customers should choose you over the competition.\n\nAnd while you keep everything moving, routine marketing and admin tasks swallow the time you could be spending on growth.\n\nThe Founder Marketing Sessions are designed to change how you approach all of it. Every Friday, we explore the strategies, business principles and practical technology that help founders build distinctive brands, make smarter marketing decisions and create more commercial impact — without unnecessarily adding to their workload.',
      },
      topicsTitle: 'What we’ll explore',
      topics: [
        { title: 'Founder-led marketing and personal brand', body: 'Turn your knowledge, experience, perspective and story into a competitive advantage. Learn how to build trust, show your expertise and make your brand memorable in a market where everyone is competing for attention.' },
        { title: 'Differentiation and market positioning', body: 'Being good at what you do isn’t enough if customers can’t see why they should choose you. Identify what makes your business valuable, position your offer more effectively and communicate your difference in a way that resonates with the people you want to reach.' },
        { title: 'The principles behind disproportionate growth', body: 'How do some businesses achieve more without matching increases in resources? From leverage and specialisation to customer lifetime value, distribution and the economics of repeat business, we look at getting more from the time, money and capabilities you already have.' },
        { title: 'AI-powered marketing and automation', body: 'Use accessible AI tools to take on repetitive work, create marketing assets, support lead generation and automate essential processes — with affordable tools, including free options where they exist. Automation doesn’t require an expensive technology budget.' },
        { title: 'Turning marketing into commercial results', body: 'Marketing isn’t about visibility, followers or more content for its own sake. It’s a path from awareness to trust, from trust to demand, and from demand to revenue. We connect your marketing activity to the outcomes that matter to your business.' },
      ],
      audience: {
        title: 'Built for founders who want to grow with intention',
        body: 'Whether you’re building your first serious customer pipeline, standing out in a crowded industry or looking for ways to scale without adding complexity, these sessions will challenge how you think about attracting, converting and keeping customers.\n\nExpect practical insights, fresh perspectives and ideas you can apply to your own business — not another hour of marketing theory.',
      },
      closing: {
        title: 'Join us every Friday',
        body: 'Because marketing should do more than keep your business visible. It should help move your business forward.',
      },
      resourcesNote: 'Everyone who joins a session gets access to free Majesty Method digital resources.',
      emptyTitle: 'The next sessions are being scheduled',
      emptyBody: 'Leave your details and we’ll let you know when registration opens.',
      seo: seoDefault('The Founder Marketing Sessions | Free Friday Webinars | Majesty Method', 'Free Friday sessions for South African founders on founder-led marketing, positioning, AI automation and turning marketing into revenue.'),
    },
  },

  // -------------------------------------------------------------------------
  {
    key: 'acceleration',
    title: 'Team Acceleration',
    group: 'Majesty Method',
    route: '/majesty-method/acceleration',
    fields: [
      { key: 'image', label: 'Photograph', type: 'image' },
      { key: 'title', label: 'Programme name', type: 'text' },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'intro', label: 'Explanation', type: 'textarea' },
      { key: 'challenge', label: 'The business challenge (dark green block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'offer', label: 'What you get', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'capabilitiesTitle', label: '“What your marketing resource learns” heading', type: 'text' },
      { key: 'capabilities', label: 'What your marketing resource learns and implements', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'body', label: 'Description', type: 'textarea' },
      ] },
      { key: 'graduateNote', label: 'Note about the graduate’s experience level', type: 'textarea' },
      { key: 'whyInternal', label: 'Why build internally (onyx block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
      ] },
      { key: 'outcome', label: 'The outcome', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text (leave a blank line between paragraphs)', type: 'textarea' },
        { key: 'closingLine', label: 'Closing line', type: 'text' },
      ] },
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
      title: 'Team Acceleration',
      headline: 'Build the in-house marketing capability your business needs to grow',
      intro: 'We help you establish a dedicated sales and marketing function: a graduate joins your business, and we develop them over a nine-month programme — with their stipend covered for the first nine months.',
      challenge: {
        title: 'When marketing is everyone’s side job',
        body: 'Your business has customers to attract, relationships to nurture, sales to close and a reputation to build. But when marketing is added to a stretched founder’s day — or handed to someone juggling five other roles — it rarely gets the consistent attention it needs.\n\nContent happens when there’s time. Leads come in with no clear follow-up. Campaigns are sporadic, customer data goes unused, and chances to keep customers or reach new markets are missed. Eventually, growth depends on how much more you, the founder, can personally take on.',
      },
      offer: {
        title: 'A dedicated resource. A trained professional. A function built around your business.',
        body: 'Instead of squeezing marketing into everyone’s existing workload, you gain an internal resource whose main job is to help your business attract customers, generate qualified leads and strengthen the systems behind revenue growth.\n\nThe graduate’s stipend is covered for the first nine months of the programme, so your business benefits from dedicated capacity while they gain practical experience. The stipend arrangement and any programme conditions are agreed upfront.\n\nThroughout those nine months, we train your graduate in the context of your business — building practical skills, implementing processes and developing the capability to support your growth beyond the programme.',
      },
      capabilitiesTitle: 'What your marketing resource learns and implements',
      capabilities: [
        { title: 'Marketing strategy and brand execution', body: 'Turning business objectives into practical marketing: planning, positioning, campaign development, graphic design, content creation and short-form video editing for social media, plus support for webinars and live sessions. The aim is to move from occasional activity to a consistent, strategically directed presence in your market.' },
        { title: 'Lead generation and sales pipeline development', body: 'Developing lead generation and prospecting, organising and qualifying incoming leads, supporting follow-up and building pipelines that move potential customers towards a purchase — so growth relies less on referrals, sporadic enquiries and the founder’s personal network.' },
        { title: 'Data analytics and market intelligence', body: 'Analysing marketing performance, interpreting customer behaviour, spotting relevant market trends and using past results to guide decisions: which products to promote, which audiences to target, which campaigns to improve and which activities no longer justify the investment.' },
        { title: 'Customer retention and revenue expansion', body: 'Growth doesn’t always require a new customer. Your graduate supports engagement, retention, loyalty and reward programmes, repeat-purchase campaigns and other ways to serve existing customers better and create additional revenue.' },
        { title: 'AI agents and intelligent automation', body: 'Practical AI applications, workflow automation and AI agent development: identifying which processes suit automation, building solutions that remove repetitive work and exploring how AI-powered services could add value — so your marketing grows more capable without simply adding manual work.' },
      ],
      graduateNote: 'A graduate is an early-career team member, not a senior marketer. The programme develops their skills alongside your business.',
      whyInternal: {
        title: 'Why build internally instead of outsourcing everything?',
        body: 'Agencies and consultants have their place. But outsourcing your entire marketing function can leave critical knowledge, customer insight and the ability to execute outside your organisation.\n\nYour brand is more than graphics and social posts. It’s your positioning, your reputation, your customer knowledge and the systems through which you generate demand. Your graduate learns your products, customers, market and commercial priorities — and the processes and insight they build stay with your business instead of being handed over to an outside provider.\n\nThe result: greater visibility of your marketing, closer alignment between marketing and sales, and an internal resource developed around your needs.',
      },
      outcome: {
        title: 'The outcome: a business better equipped to grow',
        body: 'Team Acceleration isn’t simply recruitment, a training course or a bundle of marketing services. It combines dedicated capacity, practical training and business-specific implementation to establish a sustainable in-house marketing capability — for businesses ready to move beyond founder-dependent marketing.\n\nYou stay in control of your brand. Your business keeps its customer knowledge. And marketing becomes a dedicated function, not another responsibility competing for your attention.',
        closingLine: 'Stop trying to run your business and be its entire marketing department. Build the function that lets both grow.',
      },
      steps: [
        { title: 'Discovery call', body: 'We learn about your business, your goals and how marketing works today.' },
        { title: 'Assess fit', body: 'We confirm whether the programme suits your needs and explain how it works commercially.' },
        { title: 'Agree the engagement', body: 'Scope, responsibilities, the stipend arrangement and terms are set out in writing before anything starts.' },
        { title: 'Train and implement', body: 'Your graduate is trained over the nine-month programme and applies the work in your business.' },
      ],
      suitability: 'You sell a product or service and want more consistent marketing and sales\nYou’re ready to move beyond founder-dependent marketing\nSomeone can supervise and support a graduate day to day\nYou can give the graduate the information and tools they need',
      termsNote: 'Placements depend on suitability and availability. The stipend arrangement, responsibilities and any programme conditions are confirmed in writing before you commit.',
      enquiry: {
        title: 'Book a discovery call',
        body: 'Tell us a little about your business. We’ll get back to you to arrange a call.',
      },
      seo: seoDefault('Team Acceleration | Build an In-House Marketing Function | Majesty Method', 'A graduate joins your business as a dedicated marketing resource, trained by Majesty Method over a nine-month programme, with the stipend covered for the first nine months.'),
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
      image: { id: 'seed-courses-soon', alt: 'Printed pages reading “Coming soon”, with pink tulips and a phone' },
      title: 'Digital marketing and AI courses',
      intro: 'Focused learning on one marketing, sales or AI skill at a time.',
      emptyTitle: 'New courses are in preparation',
      emptyBody: 'In the meantime, join a free Founder Marketing Session on Friday or put one of our free resources to work.',
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
        { key: 'tagline', label: 'Short line under the buttons', type: 'text' },
        cta('primary'), cta('secondary'),
      ] },
      { key: 'pillars', label: 'Four key points under the hero', type: 'list', itemLabelKey: 'title', fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      { key: 'problem', label: 'The problem (purple blocks)', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction (leave a blank line between paragraphs)', type: 'textarea' },
        { key: 'items', label: 'Frustrations (one per line; seven fill the grid best)', type: 'lines' },
        { key: 'closing', label: 'Closing line', type: 'text' },
      ] },
      { key: 'how', label: 'How it works', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'steps', label: 'Steps', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Step', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
        ] },
      ] },
      { key: 'questions', label: 'More than a tender list (three questions)', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'intro', label: 'Introduction', type: 'text' },
        { key: 'items', label: 'Questions', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Question', type: 'text' },
          { key: 'body', label: 'Answer', type: 'textarea' },
        ] },
      ] },
      { key: 'outcomes', label: 'What TenderIQ helps you do (charcoal blocks)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Benefits', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
        ] },
        { key: 'note', label: 'Note under the blocks', type: 'textarea' },
      ] },
      { key: 'powers', label: 'What powers TenderIQ', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Technology', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Text', type: 'textarea' },
        ] },
      ] },
      { key: 'comparison', label: 'Comparison table', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'leftLabel', label: 'Left column heading', type: 'text' },
        { key: 'rightLabel', label: 'Right column heading', type: 'text' },
        { key: 'rows', label: 'Rows', type: 'list', itemLabelKey: 'capability', fields: [
          { key: 'capability', label: 'Capability', type: 'text' },
          { key: 'traditional', label: 'Traditional keyword search', type: 'text' },
          { key: 'tenderiq', label: 'TenderIQ', type: 'text' },
        ] },
        { key: 'note', label: 'Note under the table', type: 'textarea' },
      ] },
      { key: 'coverage', label: 'Coverage across South Africa', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
        { key: 'provinces', label: 'Provinces (one per line)', type: 'lines' },
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
      { key: 'pricing', label: 'Pricing', type: 'group', fields: [
        { key: 'kicker', label: 'Line above the heading', type: 'text' },
        { key: 'title', label: 'Plan name', type: 'text' },
        { key: 'price', label: 'Price', type: 'text', help: 'e.g. R2,000' },
        { key: 'period', label: 'Billing period', type: 'text', help: 'e.g. / month' },
        { key: 'summary', label: 'One-line summary', type: 'text' },
        { key: 'inclusions', label: 'What’s included (one per line)', type: 'lines' },
        { key: 'note', label: 'Note under the price', type: 'textarea' },
        { key: 'ctaLabel', label: 'Button text', type: 'text' },
      ] },
      { key: 'join', label: 'How to join', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'steps', label: 'Steps', type: 'list', itemLabelKey: 'title', fields: [
          { key: 'title', label: 'Step', type: 'text' },
          { key: 'body', label: 'Description', type: 'textarea' },
        ] },
      ] },
      { key: 'register', label: 'Registration form section', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
      ] },
      { key: 'trust', label: 'What TenderIQ does and doesn’t do (purple block)', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'items', label: 'Statements (one per line)', type: 'lines' },
      ] },
      { key: 'faqs', label: 'Frequently asked questions', type: 'list', itemLabelKey: 'q', fields: [
        { key: 'q', label: 'Question', type: 'text' },
        { key: 'a', label: 'Answer', type: 'textarea' },
      ] },
      { key: 'closing', label: 'Closing call to action', type: 'group', fields: [
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Text', type: 'textarea' },
        { key: 'ctaLabel', label: 'Button text', type: 'text' },
      ] },
      seo('', ''),
    ],
    defaults: {
      hero: {
        kicker: 'AI-powered tender intelligence',
        headline: 'Your next big opportunity might be a tender you haven’t thought to search for.',
        body: 'TenderIQ matches your business capabilities with relevant tender opportunities across South Africa — helping you discover what you can pursue, understand what’s required and decide where to compete.',
        tagline: 'Personalised tender intelligence, delivered twice a week.',
        primary: { label: 'Discover your opportunities', href: '#register' },
        secondary: { label: 'See how it works', href: '#how-it-works' },
      },
      pillars: [
        { title: 'Not keyword-based', body: 'Discover opportunities based on what your business can actually do, not just the terms you think to search for.' },
        { title: 'AI-powered matching', body: 'See how closely each opportunity aligns with your company profile and what you can deliver.' },
        { title: 'Know before you apply', body: 'See the requirements, potential gaps and next steps before you invest hours in tender documents.' },
        { title: 'Delivered to your inbox', body: 'Receive tailored tender opportunities twice a week, without searching every day.' },
      ],
      problem: {
        kicker: 'The problem we solve',
        title: 'You’re searching for tenders. But are you finding the right ones?',
        intro: 'Traditional tender searches can leave businesses scrolling through irrelevant listings, relying on keywords and spending hours opening documents just to find out whether they qualify.\n\nMeanwhile, opportunities that fit their actual capabilities go unnoticed — simply because nobody searched for the right thing.',
        items: 'Suitable opportunities are found too late to respond properly\nLong documents have to be reviewed manually, one by one\nMandatory requirements are easy to miss in the detail\nMissing documents surface days before the deadline\nSubmissions are prepared under unnecessary time pressure\nOpportunities outside your usual province go unnoticed\nTime goes into screening instead of preparing a stronger bid',
        closing: 'TenderIQ changes the starting point. Your business comes first.',
      },
      how: {
        kicker: 'How TenderIQ works',
        title: 'From your company profile to your next opportunity',
        steps: [
          { title: 'Tell us about your business', body: 'Share your company profile, services, skills, experience, previous projects, certifications and other relevant capabilities.' },
          { title: 'Let AI find your fit', body: 'TenderIQ analyses available tender opportunities and evaluates how well they align with your company’s capabilities — rather than relying only on keywords you enter.' },
          { title: 'Understand the opportunity', body: 'Review a structured summary of the tender requirements, how your business measures up, and the gaps you may need to address before applying.' },
          { title: 'Receive opportunities twice a week', body: 'Get personalised tender alerts by email, so you spend less time searching and more time deciding which opportunities deserve your attention.' },
        ],
      },
      questions: {
        kicker: 'More than a tender list',
        title: 'Know what fits. See what’s missing. Decide what’s possible.',
        intro: 'Every opportunity should help you answer three questions.',
        items: [
          { title: 'Can my business do this?', body: 'See how the opportunity aligns with your company’s services, experience and capabilities.' },
          { title: 'What would I need to qualify?', body: 'Review the stated eligibility criteria, documentation, qualifications, certifications, experience and other relevant conditions.' },
          { title: 'Can I close the gaps?', body: 'Identify requirements you may not currently meet, and consider practical options — such as subcontracting, partnering with another company or bringing in qualified specialists, where the tender rules permit.' },
        ],
      },
      outcomes: {
        title: 'What TenderIQ helps you do',
        items: [
          { title: 'Discover untapped opportunities', body: 'Your business may be able to deliver in adjacent industries or categories you haven’t considered.' },
          { title: 'Spend less time screening', body: 'Review a structured summary before committing time to a full tender document.' },
          { title: 'Understand your competitiveness', body: 'See how your stated capabilities compare with the published requirements, and where you may need more capacity.' },
          { title: 'Build a smarter growth pipeline', body: 'Use the opportunities you discover to identify new services, partnerships and skills worth developing.' },
        ],
        note: 'You don’t always need to hire a complete team before exploring a larger opportunity. Sometimes a capability gap can be closed through a legitimate subcontracting arrangement, a joint venture or a qualified specialist — the tender’s own rules decide what is permitted.',
      },
      powers: {
        kicker: 'What powers TenderIQ',
        title: 'Technology you don’t have to manage',
        items: [
          { title: 'AI-powered company profiling', body: 'TenderIQ uses information about your business — your services, skills, qualifications, previous projects and available expertise — to build a picture of what you can deliver, so it can evaluate opportunities beyond a simple keyword match.' },
          { title: 'Automated web data collection', body: 'Web-scraping tools collect tender information from relevant online sources, creating a broader pool of opportunities to match against — subject to source availability, access permissions and publication schedules.' },
          { title: 'Requirements analysis and gap identification', body: 'AI structures tender requirements and compares them with your company profile, giving you a practical view of your apparent strengths, missing requirements and possible next steps.' },
          { title: 'Personalised opportunity delivery', body: 'Relevant matches are organised into email updates twice a week, so you keep sight of new opportunities without making manual tender searches part of your daily routine.' },
        ],
      },
      comparison: {
        kicker: 'TenderIQ vs traditional keyword search',
        title: 'A different starting point',
        leftLabel: 'Traditional keyword search',
        rightLabel: 'TenderIQ',
        rows: [
          { capability: 'Starting point', traditional: 'Keywords you enter', tenderiq: 'Your company profile and capabilities' },
          { capability: 'Discovering opportunities', traditional: 'Mainly search terms and filters', tenderiq: 'Designed to find relevant opportunities beyond obvious keyword matches' },
          { capability: 'Understanding requirements', traditional: 'Often means reading tender documents manually', tenderiq: 'An AI-organised summary of requirements' },
          { capability: 'Assessing suitability', traditional: 'You assess the fit yourself', tenderiq: 'A profile-based suitability assessment' },
          { capability: 'Identifying gaps', traditional: 'You compare requirements manually', tenderiq: 'Highlights apparent gaps against your profile' },
          { capability: 'Planning how to qualify', traditional: 'Your own research and networking', tenderiq: 'Possible routes to close gaps, such as subcontracting or partnering' },
          { capability: 'Receiving opportunities', traditional: 'Searches or alerts, depending on the platform', tenderiq: 'Tailored email digests, twice a week' },
          { capability: 'Geographic reach', traditional: 'Depends on the platform’s sources', tenderiq: 'Designed to cover all nine provinces' },
        ],
        note: 'Tender platforms differ in what they offer. This compares TenderIQ with a traditional keyword-based search.',
      },
      coverage: {
        kicker: 'Coverage across South Africa',
        title: 'Opportunities across all nine provinces',
        body: 'From Gauteng to the Western Cape, KwaZulu-Natal to Limpopo, TenderIQ is designed to surface opportunities across South Africa — giving your business a broader view of where it could compete.',
        provinces: 'Eastern Cape\nFree State\nGauteng\nKwaZulu-Natal\nLimpopo\nMpumalanga\nNorth West\nNorthern Cape\nWestern Cape',
      },
      industries: {
        title: 'Built for businesses that tender across sectors',
        intro: 'From construction to supply and delivery, many kinds of South African businesses pursue tenders.',
        items: [
          { label: 'Construction and infrastructure', description: 'Building, civil works and maintenance', image: { id: 'seed-tiq-construction', alt: 'A house under construction with building plans, a hard hat and a tape measure in front' } },
          { label: 'Supply and delivery', description: 'Equipment, materials and business supplies', image: { id: 'seed-tiq-supply', alt: 'A warehouse aisle with shelving stacked with boxed goods on pallets' } },
          { label: 'Logistics and commercial services', description: 'Transport, operations and facility services', image: { id: 'seed-tiq-logistics', alt: 'A container port with a cargo ship, cranes, delivery trucks and a plane overhead' } },
        ],
        note: 'Photographs show example sectors. They don’t depict TenderIQ customers or tender projects.',
      },
      example: {
        title: 'A tender in another province',
        disclaimer: 'An illustrative scenario — not a customer story, and not a guarantee of results.',
        steps: 'A Gauteng electrical contractor usually only looks at tenders close to home.\nAn opportunity in Limpopo matches their services and capacity — one they would normally have missed.\nThey check the mandatory requirements early and see that two compliance documents need updating.\nWith weeks rather than days to spare, they update the documents and plan the logistics of working out of province.\nThey decide to bid, then prepare and submit through the issuer’s official process — without a last-minute rush.',
      },
      pricing: {
        kicker: 'Pricing',
        title: 'TenderIQ Monthly',
        price: 'R2,000',
        period: '/ month',
        summary: 'Tailored tender intelligence for your business.',
        inclusions: 'AI-powered company-profile matching\nTender opportunities across all nine provinces\nPersonalised email digests, twice a week\nStructured summaries of tender requirements\nCompany suitability and gap analysis\nSuggested options for addressing capability gaps',
        note: 'We’ll confirm the subscription terms with you before you sign up.',
        ctaLabel: 'Join TenderIQ',
      },
      join: {
        title: 'How to join TenderIQ',
        steps: [
          { title: 'Choose your subscription', body: 'Sign up for the monthly TenderIQ service.' },
          { title: 'Submit your company profile', body: 'Provide your business information, services, skills, project history, certifications and relevant supporting documents.' },
          { title: 'Get your opportunities matched', body: 'Your profile informs the AI-powered process used to identify and assess suitable opportunities.' },
          { title: 'Receive your twice-weekly emails', body: 'Review matched tenders, understand the requirements and decide which opportunities to pursue.' },
        ],
      },
      register: {
        title: 'Start here',
        body: 'Tell us about your business and how you tender today. The TenderIQ team will contact you about the next steps.',
      },
      trust: {
        title: 'What TenderIQ does — and doesn’t — do',
        items: 'TenderIQ identifies opportunities and helps you assess them. It does not submit tenders on your behalf.\nA strong match is not the same as eligibility. Mandatory requirements, financial thresholds, registration status, certifications and other criteria can disqualify an otherwise promising applicant.\nTenderIQ does not replace the issuer’s official tender documents. You remain responsible for checking every requirement and submitting through the prescribed channel.\nTenderIQ cannot guarantee that you will qualify for, or be awarded, any tender, or that every available tender will be found.',
      },
      faqs: [
        { q: 'How often will I receive opportunities?', a: 'Matched opportunities are delivered by email twice a week.' },
        { q: 'Which provinces does TenderIQ cover?', a: 'TenderIQ is designed to surface opportunities across all nine provinces. What appears depends on what the sources we collect from publish.' },
        { q: 'Does TenderIQ submit tenders for me?', a: 'No. TenderIQ identifies opportunities and helps you assess them. You prepare and submit your tender through the issuer’s official process.' },
        { q: 'Does TenderIQ guarantee that I’ll win a tender?', a: 'No. A strong match is not the same as eligibility, and whether you qualify and win depends on the tender, your submission and the issuer’s evaluation.' },
        { q: 'Does TenderIQ replace the official tender documents?', a: 'No. Always read the issuer’s official documents. Requirements vary from tender to tender, and the official documents take precedence.' },
        { q: 'How is my company information used?', a: 'Your profile is used to match and assess opportunities for your business. Our privacy notice explains how your information is stored and protected.' },
      ],
      closing: {
        title: 'Your next opportunity starts with knowing your business.',
        body: 'Stop limiting your growth to the opportunities you already know how to find. Let TenderIQ show you what your capabilities could unlock.',
        ctaLabel: 'Join TenderIQ',
      },
      seo: seoDefault('TenderIQ | AI-Powered Tender Matching for South African Businesses', 'TenderIQ matches your business capabilities with relevant tender opportunities across South Africa, summarises requirements and highlights gaps — delivered twice a week.'),
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
