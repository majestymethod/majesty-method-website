// Sample data for the TenderIQ demo. Every company, person, issuer and tender here is made up.
// Platform names (eTenders, provincial portals and so on) are the kinds of sources TenderIQ scans.

export type Req = ['y' | 'q' | 'n', string];
export interface Tender {
  id: string; src: string; trial: boolean; kind: string; title: string; prov: string; what: string; issuer: string; place: string;
  budget: string; ref: string; req: Req[]; missing: string[]; confirm: string[]; provisional?: boolean; closes: string; closesShort: string;
  submit: string; instr: string; brief: string; score: number; bd: number[]; why: string;
}
export interface Past { id: string; src: string; title: string; ref: string; prov: string; closesShort: string; score: number; stage: string; sub?: string; note?: string }

export const BD = [30, 25, 20, 10, 10, 5];
export const BL = ['Scope fit', 'Eligibility', 'Team and experience', 'Location', 'Value fit', 'Timing'];

export const TENDERS: Tender[] = [
  { id: 't4', src: 'Private RFQ boards', trial: false, kind: 'Private', title: 'Hardstanding and paving, Midrand warehouse', prov: 'Gauteng',
    what: 'Supply and lay 8,500 m² of interlocking paving and stabilised hardstanding, including stormwater tie-ins.', issuer: 'Kestrel Logistics Property (Pty) Ltd', place: 'Midrand, Gauteng', budget: 'R3.2m (stated)', ref: 'KLP-RFQ-0418',
    req: [['y', 'Company registration and tax compliance'], ['y', 'Two civil works references above R2m'], ['y', 'Public liability insurance'], ['q', 'Client-approved safety file (not yet seen)']],
    missing: [], confirm: ['Do you have a safety file the client will accept?'],
    closes: 'Fri 6 Nov 2026, 12:00', closesShort: '6 Nov', submit: 'Email to the procurement desk (address on the RFQ)', instr: 'Priced bill of quantities in the client Excel format, plus a one-page method statement.', brief: 'Site visit, not compulsory. Wed 4 Nov 2026, 09:00.',
    score: 91, bd: [27, 22, 19, 10, 8, 5], why: 'Paving and hardstanding is a core service line and the site is in your home province.' },
  { id: 't1', src: 'eTenders', trial: true, kind: 'Public', title: 'Rehabilitation of 4.2 km municipal access roads', prov: 'Mpumalanga',
    what: 'Resurface and rehabilitate Ward 12 access roads, including drainage and road markings.', issuer: 'Sample Local Municipality', place: 'Mpumalanga', budget: 'Not stated', ref: 'SLM/ENG/2026/041',
    req: [['y', 'CIDB 5CE or higher (you hold 5CE)'], ['y', 'B-BBEE level 4 or better (you are level 2)'], ['y', 'Valid tax compliance status'], ['y', 'Site agent with 5 years of road experience'], ['q', 'CSD summary report dated within 30 days']],
    missing: [], confirm: ['Please send your latest CSD summary report.'], provisional: true,
    closes: 'Fri 13 Nov 2026, 11:00', closesShort: '13 Nov', submit: 'Hard copy in the tender box, Civic Centre ground floor', instr: 'One original and one copy, plus a CD of the pricing schedule.', brief: 'Compulsory. Wed 4 Nov 2026, 10:00, Municipal Engineering offices.',
    score: 96, bd: [29, 24, 19, 9, 10, 5], why: 'Road rehabilitation matches your main service line and your CIDB grade fits.' },
  { id: 't3', src: 'Gauteng provincial tender portal', trial: false, kind: 'Public', title: 'Refurbishment of six community clinics', prov: 'Gauteng',
    what: 'General building maintenance: roofing, ceilings, painting, plumbing and ablution upgrades across six clinics.', issuer: 'Provincial Department of Infrastructure', place: 'Gauteng, six sites', budget: 'R12.0m (stated)', ref: 'DID/GP/2026/233',
    req: [['y', 'CIDB 4GB or higher (you hold 4GB)'], ['y', 'Tax compliance and active CSD registration'], ['n', 'Registered construction health and safety agent, 3 years'], ['q', 'CSD profile lists building works category']],
    missing: ['Construction health and safety agent (SACPCMP registered), 3 years of experience'], confirm: ['Does your CSD profile list the building works category?'],
    closes: 'Mon 16 Nov 2026, 11:00', closesShort: '16 Nov', submit: 'Electronic upload on the provincial portal, PDF only', instr: 'Separate technical and price files. All SBD forms signed.', brief: 'Not compulsory. Virtual, Thu 5 Nov 2026, 10:00.',
    score: 93, bd: [28, 23, 18, 10, 9, 5], why: 'Building maintenance is one of your sub-sectors. One role can be outsourced.' },
  { id: 't2', src: 'Transnet eTender portal', trial: false, kind: 'Public (state-owned)', title: 'Stormwater culvert replacement, freight corridor', prov: 'Gauteng',
    what: 'Replace 14 box culverts, including temporary diversions and track-side reinstatement.', issuer: 'Highveld Freight Rail', place: 'Gauteng and Mpumalanga corridor', budget: 'R8.4m (stated)', ref: 'HFR/CIV/2026/117',
    req: [['y', 'CIDB 5CE or higher'], ['y', 'B-BBEE level 4 or better'], ['n', 'Professional engineer (Pr Eng or Pr Tech Eng) as technical lead, 5 years'], ['q', 'Safety, health and environment plan']],
    missing: ['Registered Pr Eng or Pr Tech Eng with 5 years of drainage experience'], confirm: ['Can you partner with an engineer for this tender?'],
    closes: 'Tue 17 Nov 2026, 14:00', closesShort: '17 Nov', submit: 'Electronic, through the Transnet eTender portal', instr: 'Upload technical and commercial envelopes separately. Late uploads are rejected.', brief: 'Not compulsory. Virtual, Thu 5 Nov 2026, 11:00.',
    score: 91, bd: [28, 22, 17, 10, 9, 5], why: 'Strong scope and location match. The score is lower because the engineer role is missing.' },
  { id: 't6', src: 'Rand Water supplier portal', trial: false, kind: 'Public', title: 'Pipeline trench reinstatement, contractor panel', prov: 'Gauteng',
    what: 'Three-year panel for trench backfill, compaction and road surface reinstatement after pipeline repairs.', issuer: 'Vaal Bulk Water Board', place: 'Johannesburg and Ekurhuleni', budget: 'Panel, no fixed value', ref: 'VBW/PNL/2026/09',
    req: [['y', 'CIDB 4CE or higher'], ['y', 'Tax compliance and valid CSD'], ['y', 'Two reinstatement projects in the last 5 years'], ['q', 'Plant ownership list (you listed hired plant only)']],
    missing: [], confirm: ['Is your plant owned or hired? The panel prefers owned.'],
    closes: 'Wed 18 Nov 2026, 10:00', closesShort: '18 Nov', submit: 'Electronic, through the supplier portal', instr: 'Panel application form and references in a single PDF.', brief: 'None.',
    score: 92, bd: [27, 23, 19, 9, 9, 5], why: 'Reinstatement work is in your activities and the panel is inside your home province.' },
  { id: 't5', src: 'Eskom Tender Bulletin', trial: false, kind: 'Public (state-owned)', title: 'Substation civils: foundations and cable trenches', prov: 'Mpumalanga',
    what: 'Excavate and cast foundations for transformer bays and build cable trenches at a 132 kV substation.', issuer: 'Highveld Power Utility', place: 'Mpumalanga', budget: 'Not stated', ref: 'HPU/SUB/2026/078',
    req: [['y', 'CIDB 5CE or higher'], ['y', 'B-BBEE level 2 or better (you are level 2)'], ['n', 'Registered construction safety officer, 3 years'], ['q', 'Concrete cube testing arrangement']],
    missing: ['Construction safety officer (SACPCMP registered), 3 years of experience'], confirm: ['Which laboratory do you use for cube testing?'],
    closes: 'Thu 19 Nov 2026, 10:00', closesShort: '19 Nov', submit: 'Hard copy, supply chain office, with a tender-box receipt', instr: 'Two sealed envelopes, one technical and one commercial.', brief: 'Compulsory. Tue 10 Nov 2026, 09:00, on site.',
    score: 90, bd: [27, 22, 18, 9, 9, 5], why: 'Civil foundations match your scope. You would need to bring in a safety officer.' },
];

export const PAST: Past[] = [
  { id: 'p5', src: 'Private RFQ boards', title: 'Fencing and guardhouse, logistics park', ref: 'KLP-RFQ-0391', prov: 'Gauteng', closesShort: '30 Oct', score: 91, stage: 'Preparing', note: 'Quote requested from fencing supplier' },
  { id: 'p6', src: 'eTenders', title: 'Culvert headwalls, rural roads', ref: 'SLM/ENG/2026/036', prov: 'Mpumalanga', closesShort: '4 Nov', score: 90, stage: 'Not applying', note: 'Crew committed to Ward 12 job' },
  { id: 'p1', src: 'eTenders', title: 'Paving and kerbing, school precinct', ref: 'EKU/CIV/2026/204', prov: 'Gauteng', closesShort: '9 Oct', score: 95, stage: 'Under evaluation', sub: '2026-10-06', note: 'Clarification call booked' },
  { id: 'p2', src: 'Gauteng provincial tender portal', title: 'Refurbishment of regional depot offices', ref: 'DID/GP/2026/198', prov: 'Gauteng', closesShort: '2 Oct', score: 92, stage: 'Awarded', sub: '2026-09-29', note: 'Site handover 9 Nov' },
  { id: 'p3', src: 'Rand Water supplier portal', title: 'Bulk water line trenching', ref: 'VBW/CIV/2026/52', prov: 'Gauteng', closesShort: '25 Sep', score: 93, stage: 'Not awarded', sub: '2026-09-22', note: 'Lost on price by 3%' },
  { id: 'p4', src: 'Private RFQ boards', title: 'Access road grading, mine village', ref: 'MVL-RFQ-0112', prov: 'Limpopo', closesShort: '18 Sep', score: 90, stage: 'Submitted', sub: '2026-09-16', note: '' },
];

export const STAGES = ['Received', 'Preparing', 'Submitted', 'Under evaluation', 'Awarded', 'Not awarded', 'Not applying'];
export const SOURCES: [string, number, boolean][] = [
  ['eTenders', 187, true], ['Municipal portals (Johannesburg, Ekurhuleni, Tshwane)', 98, false], ['Gauteng provincial tender portal', 64, false],
  ['Private RFQ boards', 41, false], ['Transnet eTender portal', 22, false], ['Eskom Tender Bulletin', 15, false], ['Rand Water supplier portal', 9, false],
];
export const WEEKS = ['7 Sep', '14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct'];
export const STATS = {
  sub: { recv: [5, 6, 4, 7, 6, 8, 5, 6], app: [2, 3, 2, 4, 3, 4, 2, 3], prov: [['Gauteng', 21], ['Mpumalanga', 11], ['Limpopo', 8], ['North West', 4], ['Free State', 3]] as [string, number][], pub: 38, priv: 9, wait: 9, won: 2 },
  trial: { recv: [0, 0, 0, 0, 0, 0, 0, 1], app: [0, 0, 0, 0, 0, 0, 0, 0], prov: [['Mpumalanga', 1]] as [string, number][], pub: 1, priv: 0, wait: 0, won: 0 },
};
export const PROFILE: [string, string, string, string, string][] = [
  ['Identity', 'Registered name', 'Dube & Mokoena Civil Works (Pty) Ltd', 'Registration form', 'high'],
  ['Identity', 'Years in business', '8 (since 2018)', 'Company profile PDF', 'high'],
  ['Identity', 'Ownership', '100% black-owned', 'Company profile PDF', 'high'],
  ['Activities', 'Service lines', 'Roads and paving, stormwater, building maintenance, trench reinstatement', 'Form and profile PDF', 'high'],
  ['Preferences', 'Provinces wanted', 'Gauteng, Mpumalanga, Limpopo', 'Registration form', 'high'],
  ['Preferences', 'Provinces excluded', 'Western Cape', 'Registration form', 'high'],
  ['Preferences', 'Contract value', 'R1m to R25m', 'Registration form', 'medium'],
  ['Compliance', 'CIDB grading', '5CE, 4GB', 'Registration form', 'high'],
  ['Compliance', 'B-BBEE level', 'Level 2', 'Registration form', 'high'],
  ['Compliance', 'CSD status', 'Active (report date unconfirmed)', 'Registration form', 'medium'],
  ['Team', 'Key staff', '2 site agents, 1 quantity surveyor, 14 site crew', 'Company profile PDF', 'medium'],
  ['Team', 'Roles to outsource', 'Safety officer, land surveyor', 'Registration form', 'high'],
];
export const CHECKLIST = ['Company registration (CIPC)', 'Tax compliance status', 'CSD summary report', 'B-BBEE certificate', 'CIDB registration certificate', 'Priced schedule', 'Signed declaration forms (SBD)'];
