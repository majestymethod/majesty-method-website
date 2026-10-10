# SEO implementation

Source: **Majesty Method & TenderIQ – SEO Keyword Research Brief** (uploaded 10 October 2026).
The brief contains keyword *candidates* and intent hypotheses. It contains no verified South African search volumes or
difficulty scores, so none are claimed here. Validate with Google Keyword Planner (location: South Africa), Search Console
and live results before investing in content around any single term.

## Keyword → page mapping (one primary cluster per page)

| Page | Primary cluster (from the brief) | Where it's used |
|---|---|---|
| `/majesty-method` | marketing strategy for small businesses in South Africa; AI implementation for businesses South Africa | Title, meta description, line above the H1, Organization structured data |
| `/majesty-method/bootcamp` | marketing training for entrepreneurs; digital marketing training South Africa; AI training for entrepreneurs | Title, description, **H1** ("Founder Bootcamp: marketing and AI training for entrepreneurs"), Course structured data |
| `/majesty-method/acceleration` | marketing support for small businesses South Africa; AI automation for small businesses; internal marketing function | Title, description, H1, Service structured data |
| `/majesty-method/webinars` | how to use AI to market my small business (educational) | Title, description, H1 ("Free Friday webinars on marketing and AI") |
| `/majesty-method/courses` | digital marketing training | Title, description, H1 |
| `/majesty-method/resources` | lead generation for small businesses (educational) | Title, description, H1 |
| `/tenderiq` | tenders in South Africa; find tenders for my business; tender opportunities for small businesses; how to know if my business qualifies for a tender | Title, description, line above the H1, FAQ ("How do I know if my business qualifies for a tender?"), industries section (construction; supply and delivery; logistics) |
| `/` | brand: Majesty Method & TenderIQ | Title, description, Organization + WebSite structured data |

Keywords were added only where they accurately describe the page. Terms that imply capabilities not yet confirmed
(**latest tenders**, **tender management software**, **how to track tender closing dates**, **government tenders** as listings)
were deliberately **not** targeted, as the brief advises.

## Technical SEO in place
- Unique title + meta description per page (all editable under each page's "Search & sharing").
- One H1 per page; H2 for sections; H3 for items (tested).
- Canonical URLs from `SITE_URL`; Open Graph + Twitter cards; branded share images for each brand.
- `/sitemap.xml` with last-published dates; `/robots.txt` blocks `/admin`, `/api/`, `/unsubscribe`.
- Structured data built only from visible, verified information: Organization (no street address, no ratings),
  WebSite, Course (Bootcamp), Service (Acceleration, TenderIQ), FAQPage (Bootcamp and TenderIQ FAQs), BreadcrumbList.
  Note: Google currently shows FAQ rich results mainly for government and health sites; the markup still helps machines
  understand the content.
- `/llms.txt`: a plain summary of both brands for AI assistants. This is an emerging convention, **not** a ranking factor,
  and nothing can force an assistant to recommend a business.
- Server-rendered HTML (content is crawlable without JavaScript), descriptive alt text, fast mobile pages
  (Lighthouse SEO 100 on all pages measured).

## Outside the website's control
- Rankings, AI-assistant mentions and click-through can't be guaranteed.
- Google Business Profile, reviews, backlinks and press mentions build trust off-site.
- Search Console verification needs the live domain.

## Recommended next steps
1. Verify the domain in Google Search Console and submit the sitemap.
2. Run the brief's research workflow and record volumes/difficulty in the suggested spreadsheet.
3. Publish the brief's content ideas as genuinely useful pieces (e.g. "How to screen a tender before committing time",
   "Why your social media is not turning into sales"). The site would need a simple blog/articles section for this — ask
   a developer, or publish them as free resources in the meantime.
4. Add industry pages for TenderIQ only where accurate, maintained guidance can be provided.
