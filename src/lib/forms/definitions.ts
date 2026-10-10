// Form schemas. Admins can edit labels, help text, options, required/optional,
// order and visibility, and add new fields. Fields marked `locked` are used by
// the system (email routing, Sheets mapping, consent records) and can't be removed.

export type InputType = 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'radio' | 'checkboxes';

export interface FormField {
  key: string;
  label: string;
  type: InputType;
  required: boolean;
  enabled: boolean;
  locked?: boolean;
  help?: string;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
  autocomplete?: string;
  /** Exact column header in the destination Google Sheet (Sheets-enabled forms only). */
  sheetColumn?: string;
  /** Marks options inferred from existing responses that the owner should confirm. */
  inferred?: boolean;
}

export interface FormDef {
  key: FormKey;
  title: string;
  brand: 'majesty' | 'tenderiq';
  description: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  marketingConsent: boolean;
  privacyLabel: string;
  notifyTo: string; // comma-separated team addresses (email only sent if SMTP configured)
  sendAcknowledgement: boolean;
  acknowledgementSubject: string;
  acknowledgementBody: string;
  sheets: {
    enabled: boolean;
    sheetName: string;
    /** System columns written alongside field columns. */
    timestampColumn: string;
    respondentEmailColumn: string;
  };
  fields: FormField[];
  /**
   * Contact form only: route notifications by enquiry type.
   * One rule per line: "TenderIQ = team@example.com, other@example.com".
   */
  routing?: string;
}

export type FormKey = 'bootcamp' | 'webinar' | 'acceleration' | 'tenderiq' | 'contact' | 'resource';

const PRIVACY_LABEL = 'I have read the privacy notice and agree to my information being used to respond to this request.';

const base = {
  marketingConsent: true,
  privacyLabel: PRIVACY_LABEL,
  notifyTo: '',
  sendAcknowledgement: true,
  sheets: { enabled: false, sheetName: '', timestampColumn: 'Timestamp', respondentEmailColumn: '' },
};

export const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];

export const DEFAULT_FORMS: Record<FormKey, FormDef> = {
  bootcamp: {
    ...base,
    key: 'bootcamp', brand: 'majesty',
    title: 'Founder Bootcamp registration',
    description: 'Mirrors the “OCTOBER 26 VISIBILITY BOOTCAMP REGISTRATION FORM” Google Form and writes to its response sheet.',
    submitLabel: 'Register for the Bootcamp',
    successTitle: 'Your registration has been received',
    successMessage: 'Thank you. The Majesty Method team will contact you on WhatsApp or email with cohort dates and next steps.',
    acknowledgementSubject: 'Your Founder Bootcamp registration',
    acknowledgementBody: 'Hi {{name}},\n\nThank you for registering for the Majesty Method Founder Bootcamp. We have received your details and will be in touch with cohort dates and next steps.\n\nMajesty Method',
    sheets: { enabled: true, sheetName: 'Form responses 1', timestampColumn: 'Timestamp', respondentEmailColumn: 'Email address' },
    fields: [
      { key: 'name', label: 'Name and surname', type: 'text', required: true, enabled: true, locked: true, autocomplete: 'name', maxLength: 120, sheetColumn: 'NAME AND SURNAME' },
      { key: 'email', label: 'Email address', type: 'email', required: true, enabled: true, locked: true, autocomplete: 'email', maxLength: 200, sheetColumn: 'EMAIL ADDRESS' },
      { key: 'phone', label: 'Phone number (WhatsApp)', type: 'tel', required: true, enabled: true, autocomplete: 'tel', maxLength: 30, sheetColumn: 'PHONE NUMBER (WHATSAPP)' },
      { key: 'business', label: 'Business name and description', type: 'textarea', required: true, enabled: true, maxLength: 1000, help: 'Your business name and a sentence or two on what you sell.', sheetColumn: 'BUSINESS NAME AND DESCRIPTION' },
      { key: 'registered', label: 'Is your business registered?', type: 'radio', required: true, enabled: true, options: ['Yes', 'No'], sheetColumn: 'IS YOUR BUSINESS REGISTERED' },
      { key: 'employees', label: 'How many employees does your business have?', type: 'radio', required: true, enabled: true, inferred: true, options: ['1 (Just me)', '2 - 4 employees', '5 - 10 employees', 'More than 10 employees'], sheetColumn: 'HOW MANY EMPLOYEES DOES YOUR BUSINESS HAVE' },
      { key: 'social', label: 'Do you have social media platforms for your business?', type: 'radio', required: true, enabled: true, inferred: true, options: ['Yes', 'No'], sheetColumn: 'Do you have social media platforms for your business' },
      { key: 'marketer', label: 'Who is currently doing your marketing?', type: 'radio', required: true, enabled: true, inferred: true, options: ['Me', 'An employee in my business (include their email address so they can be part of this session with you)', 'An agency or freelancer', 'Nobody at the moment'], sheetColumn: 'Who is currently doing your marketing?' },
      { key: 'marketerEmail', label: 'Employee’s email address (if an employee does your marketing)', type: 'email', required: false, enabled: true, maxLength: 200, help: 'Optional. Only if you’d like them to take part with you.' },
    ],
  },

  webinar: {
    ...base,
    key: 'webinar', brand: 'majesty',
    title: 'Webinar registration',
    description: 'Registers people for a specific webinar, or for updates when no session is scheduled.',
    submitLabel: 'Register',
    successTitle: 'You’re registered',
    successMessage: 'Thank you for registering. You now have access to the free Majesty Method resources.',
    acknowledgementSubject: 'Your Majesty Method webinar registration',
    acknowledgementBody: 'Hi {{name}},\n\nYou’re registered for {{webinar}}.\n\n{{joining}}\n\nMajesty Method',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, enabled: true, locked: true, autocomplete: 'name', maxLength: 120 },
      { key: 'email', label: 'Email address', type: 'email', required: true, enabled: true, locked: true, autocomplete: 'email', maxLength: 200 },
      { key: 'business', label: 'Business name', type: 'text', required: false, enabled: true, autocomplete: 'organization', maxLength: 200 },
    ],
  },

  acceleration: {
    ...base,
    key: 'acceleration', brand: 'majesty',
    title: 'Business Acceleration enquiry',
    description: 'Discovery-call enquiry for the Business Acceleration Programme.',
    submitLabel: 'Request a discovery call',
    successTitle: 'Your enquiry has been received',
    successMessage: 'Thank you. We’ll contact you to arrange a discovery call. No meeting has been booked yet.',
    acknowledgementSubject: 'Your Business Acceleration enquiry',
    acknowledgementBody: 'Hi {{name}},\n\nThank you for your interest in the Business Acceleration Programme. We’ll be in touch to arrange a discovery call.\n\nMajesty Method',
    fields: [
      { key: 'businessName', label: 'Business name', type: 'text', required: true, enabled: true, autocomplete: 'organization', maxLength: 200 },
      { key: 'name', label: 'Contact person', type: 'text', required: true, enabled: true, locked: true, autocomplete: 'name', maxLength: 120 },
      { key: 'email', label: 'Work email', type: 'email', required: true, enabled: true, locked: true, autocomplete: 'email', maxLength: 200 },
      { key: 'phone', label: 'Telephone', type: 'tel', required: true, enabled: true, autocomplete: 'tel', maxLength: 30 },
      { key: 'website', label: 'Business website', type: 'url', required: false, enabled: true, autocomplete: 'url', maxLength: 300, placeholder: 'https://' },
      { key: 'needs', label: 'What are your current marketing needs?', type: 'textarea', required: true, enabled: true, maxLength: 2000 },
      { key: 'context', label: 'Anything else we should know?', type: 'textarea', required: false, enabled: true, maxLength: 2000 },
    ],
  },

  tenderiq: {
    ...base,
    key: 'tenderiq', brand: 'tenderiq',
    title: 'TenderIQ registration of interest',
    description: 'Registration of interest for TenderIQ.',
    submitLabel: 'Register interest',
    successTitle: 'Registration received',
    successMessage: 'Thank you. The TenderIQ team will review your details and contact you about next steps.',
    acknowledgementSubject: 'Your TenderIQ registration',
    acknowledgementBody: 'Hi {{name}},\n\nThank you for registering your interest in TenderIQ. The team will review your details and contact you about next steps.\n\nTenderIQ',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, enabled: true, locked: true, autocomplete: 'name', maxLength: 120 },
      { key: 'businessName', label: 'Business name', type: 'text', required: true, enabled: true, autocomplete: 'organization', maxLength: 200 },
      { key: 'email', label: 'Business email', type: 'email', required: true, enabled: true, locked: true, autocomplete: 'email', maxLength: 200 },
      { key: 'phone', label: 'Contact number', type: 'tel', required: true, enabled: true, autocomplete: 'tel', maxLength: 30 },
      { key: 'province', label: 'Your province', type: 'select', required: true, enabled: true, options: PROVINCES },
      { key: 'sector', label: 'Sector or industry', type: 'text', required: true, enabled: true, maxLength: 200, placeholder: 'e.g. Construction, cleaning services, ICT' },
      { key: 'size', label: 'Business size', type: 'select', required: false, enabled: true, options: ['Just me', '2–10 people', '11–50 people', '51–200 people', 'More than 200 people'] },
      { key: 'experience', label: 'Tendering experience', type: 'radio', required: true, enabled: true, options: ['We haven’t tendered yet', 'We’ve tendered a few times', 'We tender regularly'] },
      { key: 'challenges', label: 'What are your main challenges with finding and assessing tenders?', type: 'textarea', required: false, enabled: true, maxLength: 2000 },
      { key: 'interests', label: 'Types of tenders or provinces you’re interested in', type: 'textarea', required: false, enabled: true, maxLength: 2000 },
    ],
  },

  contact: {
    ...base,
    key: 'contact', brand: 'majesty',
    title: 'General contact',
    description: 'Central contact form. Enquiry type routes notifications.',
    submitLabel: 'Send message',
    successTitle: 'Message received',
    successMessage: 'Thank you for getting in touch. We’ll reply to the email address you provided.',
    acknowledgementSubject: 'We’ve received your message',
    acknowledgementBody: 'Hi {{name}},\n\nThank you for contacting us. We’ve received your message and will reply as soon as we can.\n\nMajesty Method',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, enabled: true, locked: true, autocomplete: 'name', maxLength: 120 },
      { key: 'email', label: 'Email address', type: 'email', required: true, enabled: true, locked: true, autocomplete: 'email', maxLength: 200 },
      { key: 'phone', label: 'Telephone (optional)', type: 'tel', required: false, enabled: true, autocomplete: 'tel', maxLength: 30 },
      { key: 'business', label: 'Business name (optional)', type: 'text', required: false, enabled: true, autocomplete: 'organization', maxLength: 200 },
      { key: 'enquiryType', label: 'What is your enquiry about?', type: 'select', required: true, enabled: true, locked: true, options: ['Founder Bootcamp', 'Business Acceleration', 'Courses', 'Webinars', 'Digital resources', 'TenderIQ', 'Privacy or data request', 'General enquiry'] },
      { key: 'message', label: 'Message', type: 'textarea', required: true, enabled: true, maxLength: 4000 },
    ],
  },

  resource: {
    ...base,
    key: 'resource', brand: 'majesty',
    title: 'Resource download request',
    description: 'Shown before downloading resources marked “Ask for name and email”.',
    submitLabel: 'Get the resource',
    successTitle: 'Your download is ready',
    successMessage: 'Use the button below to download. The link works for 24 hours.',
    sendAcknowledgement: false,
    acknowledgementSubject: '',
    acknowledgementBody: '',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, enabled: true, locked: true, autocomplete: 'name', maxLength: 120 },
      { key: 'email', label: 'Email address', type: 'email', required: true, enabled: true, locked: true, autocomplete: 'email', maxLength: 200 },
    ],
  },
};
