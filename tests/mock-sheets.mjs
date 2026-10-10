// Local stand-in for the Apps Script web app, implementing the same protocol,
// with the real response sheet's header row. Records rows to a JSON file.
import http from 'node:http';
import fs from 'node:fs';
const HEADERS = ['Timestamp', 'Email address', 'NAME AND SURNAME', 'EMAIL ADDRESS', 'PHONE NUMBER (WHATSAPP)', 'BUSINESS NAME AND DESCRIPTION', 'IS YOUR BUSINESS REGISTERED', 'HOW MANY EMPLOYEES DOES YOUR BUSINESS HAVE', 'Do you have social media platforms for your business', 'Who is currently doing your marketing?'];
const OUT = process.argv[2] || '/tmp/mock-sheet.json';
const SECRET = process.env.SECRET || 'test-secret';
const rows = []; const seen = new Set();
let failNext = 0;
http.createServer((req, res) => {
  if (req.url === '/fail-next') { failNext = 1; res.end('ok'); return; }
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    const j = JSON.parse(b || '{}');
    const send = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    if (failNext) { failNext = 0; res.statusCode = 500; return send({ ok: false, error: 'simulated outage' }); }
    if (j.secret !== SECRET) return send({ ok: false, error: 'unauthorised' });
    if (seen.has(j.submissionId)) return send({ ok: true, duplicate: true });
    const headers = [...HEADERS];
    const row = new Array(headers.length).fill('');
    const unknown = [];
    if (j.timestampColumn) row[headers.indexOf(j.timestampColumn)] = j.timestamp;
    for (const [h, v] of Object.entries(j.values)) {
      let i = headers.indexOf(h);
      if (i === -1 && h.startsWith('Website:')) { headers.push(h); row.push(''); i = headers.length - 1; }
      if (i === -1) { unknown.push(h); continue; }
      row[i] = v;
    }
    seen.add(j.submissionId); rows.push(Object.fromEntries(headers.map((h, i) => [h, row[i]])));
    fs.writeFileSync(OUT, JSON.stringify(rows, null, 2));
    send({ ok: true, row: rows.length + 1, unknownHeaders: unknown });
  });
}).listen(4100, () => console.log('mock sheets on 4100'));
