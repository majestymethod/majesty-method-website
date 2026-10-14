import type { DocDef, FieldDef } from './schema';

// Legal drafts. These are technical starting points written for this website's
// actual data flows. They are NOT legal advice and must be reviewed by a qualified
// South African legal professional before launch.
//
// {{tokens}} are filled from Business details & site settings at render time, so
// business details only need to be entered once.

const legalFields: FieldDef[] = [
  { key: 'title', label: 'Page title', type: 'text' },
  { key: 'lastUpdated', label: 'Last updated', type: 'text' },
  { key: 'reviewStatus', label: 'Review status', type: 'select', options: ['Draft — awaiting legal review', 'Reviewed'], help: 'While “Draft”, a notice is shown at the top of the page.' },
  { key: 'body', label: 'Content (Markdown)', type: 'markdown', help: 'Use {{registeredName}}, {{email}}, {{ioName}} etc. to insert business details from Settings.' },
  { key: 'seo', label: 'Search & sharing', type: 'group', fields: [
    { key: 'title', label: 'Page title', type: 'text' },
    { key: 'description', label: 'Meta description', type: 'textarea' },
  ] },
];

const PRIVACY = `This notice explains how {{brandName}} ("we", "us") collects and uses personal information through this website, including the TenderIQ pages, and the rights you have under the Protection of Personal Information Act, 2013 (POPIA).

## Who we are

The responsible party is **{{registeredName}}** ({{legalStatus}}, registration number {{registrationNumber}}), trading as {{brandName}} and TenderIQ.

- Physical address: {{physicalAddress}}
- Email: {{email}}
- Telephone: {{phone}}

**Information Officer:** {{ioName}} — {{ioEmail}}

## What we collect and why

We only collect what we need for the purpose you are engaging with.

| When you… | We collect | Why |
|---|---|---|
| Register for the Founder Bootcamp | Name, email, WhatsApp number, business name and description, whether the business is registered, number of employees, social media use, who does your marketing | To process your registration, contact you about the programme and tailor it to your business |
| Register for a webinar | Name, email, optional business name | To register you, send joining details and give you access to the free resources offered with the webinar |
| Enquire about the Team Acceleration programme | Business name, contact person, work email, telephone, website, marketing needs and context | To respond to your enquiry and arrange a discovery call |
| Register interest in TenderIQ | Name, business name, business email, contact number, province, sector, business size, tendering experience, challenges and interests | To understand your tendering needs and contact you about TenderIQ |
| Send a general enquiry | Name, email, optional telephone and business name, enquiry type and message | To respond to you |
| Request a gated resource | Name and email | To provide the resource |
| Opt in to marketing | Email, the consent wording you agreed to and when | To send occasional marketing emails, and to prove consent |

We also record the page a form was submitted from, the time of submission and a one-way, non-reversible fingerprint of your IP address (used only to block abuse such as spam).

We do not ask for identity numbers, banking details or special personal information through this website.

## Lawful basis

We process your information because it is necessary to respond to a request you made or to take steps towards an agreement with you, because it serves our legitimate interest in operating and protecting this website, or — for marketing — because you consented.

## Marketing

Marketing consent is always optional and separate from your enquiry or registration. You can withdraw it at any time using the unsubscribe link in any marketing email, or by contacting us. Withdrawing does not affect messages we need to send about a service you requested.

## Who we share information with

We do not sell personal information. We share it only with service providers (operators) who process it on our behalf, under appropriate agreements:

- **Website hosting provider** — stores the website and its database. [CONFIRM: hosting provider and server location]
- **Google (Google Sheets and Google Workspace)** — Bootcamp registrations are copied to a Google Sheet used by our team. Google may store data outside South Africa.
- **Email delivery provider** — sends confirmations and notifications, if enabled. [CONFIRM: email provider]
- **Analytics provider** — only if analytics is enabled and you consent to analytics cookies. [CONFIRM if used]

## Cross-border transfers

Some providers, including Google, may store or process information outside South Africa. Where this happens, we rely on providers that are subject to laws, binding corporate rules or agreements that give a level of protection substantially similar to POPIA, as required by section 72. [LEGAL REVIEW: confirm transfer basis for each provider]

## How long we keep it

We keep form submissions for up to {{retentionMonths}} months after our last interaction with you, unless a longer period is required by law or for an agreement with you. Marketing consent records are kept for as long as we send you marketing and for a reasonable period afterwards to demonstrate compliance.

## How we protect it

The website is served over HTTPS. Submissions are stored in a private database that is not publicly accessible. Administrative access requires an individual account, and only authorised people can view submissions. Should a security compromise occur that affects your information, we will notify the Information Regulator and affected people as required by section 22 of POPIA.

## Your rights

You have the right to:

- ask whether we hold personal information about you and request a copy of it;
- ask us to correct or delete information that is inaccurate, irrelevant, excessive, out of date, incomplete, misleading or obtained unlawfully;
- object to processing based on legitimate interest, and object at any time to direct marketing;
- withdraw consent where we rely on it;
- lodge a complaint with the Information Regulator.

To make a request, email {{ioEmail}} or use the contact form and choose "Privacy or data request". We may need to verify your identity before acting on a request.

## Complaints

If you are unhappy with how we handle your information, please contact us first so we can try to resolve it. You may also complain to the **Information Regulator (South Africa)**. Complaint forms and contact details are published at [inforegulator.org.za](https://inforegulator.org.za).

## Changes

We will update this notice when our processing changes. The date at the top shows when it was last updated.
`;

const COOKIES = `This policy explains the cookies and similar technologies used on this website. The table above is generated from the website's actual configuration, so it always reflects what is currently in use.

## Essential cookies

Essential cookies make the website work and keep it secure. They do not track you across other websites and cannot be switched off.

- **mm_consent** remembers your cookie choices so we don't ask again on every visit.
- **mm_session** and **mm_preview** are only set when an authorised team member signs in to edit the website.

## Analytics cookies

Analytics cookies would help us understand how visitors use the website. They are only used if analytics is enabled, and only after you accept them. If we enable analytics, it is listed in the table above.

## Marketing cookies

We do not use advertising or marketing cookies.

## Embedded content

The website does not embed third-party video players, maps or social media feeds. Links to other websites, such as external registration pages, are governed by those websites' own policies.

## Changing your choices

Use **Cookie settings** in the footer at any time to review or change your choices. You can also delete cookies through your browser settings.

## Contact

Questions about this policy: {{email}}.
`;

const TERMS = `These terms govern your use of this website, operated by **{{registeredName}}** trading as {{brandName}} and TenderIQ. By using the website you agree to them.

These are general website terms. Paid programmes, courses and any future TenderIQ subscription are governed by separate terms that are provided before you commit. [APPROVED PROGRAMME / COURSE / SUBSCRIPTION TERMS TO BE ADDED]

## Using the website

You may use the website for lawful purposes. You may not:

- attempt to gain unauthorised access to the website, its systems or data;
- submit false information, spam or harmful code through its forms;
- interfere with the website's operation or security.

## Intellectual property

The content, design, logos, text, graphics and downloadable resources on this website belong to {{registeredName}} or its licensors. Free resources may be used within your own business. You may not resell, republish or redistribute them without written permission.

## Information on this website

We aim to keep the website accurate and up to date, but its content is general information, not professional advice for your specific circumstances. Descriptions of programmes and products may change.

TenderIQ information supports finding and assessing tender opportunities. It does not replace the issuer's official tender documents, and you remain responsible for verifying requirements and submitting through the prescribed channel.

## Third-party links

The website may link to websites we don't control. We are not responsible for their content or practices.

## Availability

We may update, suspend or withdraw the website, or any part of it, without notice. We do not guarantee that it will always be available or free of errors.

## Liability

To the extent permitted by law, we are not liable for loss arising from your use of, or reliance on, the website's general information. Nothing in these terms limits any right you have under the Consumer Protection Act, 2008 or other law that cannot lawfully be limited. [LEGAL REVIEW: confirm limitation-of-liability wording]

## Notices and contact

{{registeredName}} — {{physicalAddress}}

Email: {{email}} · Telephone: {{phone}}

Legal notices may be delivered to: {{postalAddress}}

## Governing law

These terms are governed by the laws of the Republic of South Africa.

## Changes

We may update these terms. The date at the top shows when they were last updated.
`;

const PAIA = `The Promotion of Access to Information Act, 2000 (PAIA) gives people the right to request access to records held by private bodies where the record is required to exercise or protect a right.

## Our details

- Private body: **{{registeredName}}** ({{legalStatus}}), trading as {{brandName}} and TenderIQ
- Registration number: {{registrationNumber}}
- Physical address: {{physicalAddress}}
- Postal address: {{postalAddress}}
- Telephone: {{phone}}
- Email: {{email}}
- Information Officer: {{ioName}} — {{ioEmail}}

## PAIA manual

[LEGAL REVIEW: Confirm whether {{registeredName}} must compile a PAIA manual. Depending on the number of employees, annual turnover and sector, some small private bodies have been exempted by the Information Regulator from compiling a manual. If a manual is required, attach it here or link to it.]

## Records we hold

The categories of records this website creates are described in our [privacy notice](/legal/privacy): programme registrations, webinar registrations, enquiries, TenderIQ interest registrations, resource requests and marketing consent records.

## How to request access

1. Complete the prescribed request form (Form 2), available from the Information Regulator at [inforegulator.org.za](https://inforegulator.org.za).
2. Send it to the Information Officer at {{ioEmail}}.
3. A prescribed fee may be payable. We will tell you if it is.
4. We will respond within the period set by PAIA.

For requests about your own personal information, you can also use the process described in our [privacy notice](/legal/privacy).

## Information Regulator

Guidance on PAIA, prescribed forms and complaint procedures is available from the Information Regulator at [inforegulator.org.za](https://inforegulator.org.za).
`;

const make = (key: string, slug: string, title: string, body: string, desc: string): DocDef => ({
  key, title, group: 'Legal', route: `/legal/${slug}`, fields: legalFields,
  defaults: { title, lastUpdated: '10 October 2026', reviewStatus: 'Draft — awaiting legal review', body, seo: { title: `${title} — Majesty Method`, description: desc } },
});

export const LEGAL_DOCS: DocDef[] = [
  make('legal_privacy', 'privacy', 'Privacy notice', PRIVACY, 'How Majesty Method and TenderIQ collect, use and protect personal information, and your rights under POPIA.'),
  make('legal_cookies', 'cookies', 'Cookie policy', COOKIES, 'The cookies used on the Majesty Method and TenderIQ website and how to manage your choices.'),
  make('legal_terms', 'terms', 'Website terms', TERMS, 'Terms of use for the Majesty Method and TenderIQ website.'),
  make('legal_paia', 'paia', 'PAIA information', PAIA, 'How to request access to records held by Majesty Method under the Promotion of Access to Information Act.'),
];
