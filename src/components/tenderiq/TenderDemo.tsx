'use client';

/*
 * Interactive TenderIQ demo: a tender email and the client dashboard, for either the free week ("trial")
 * or a paying subscriber ("sub"). Everything is sample data (see demo-data.ts) and nothing is saved:
 * marking a tender in the email updates the dashboard row, and the dashboard fields can be edited,
 * but it all resets when the page reloads.
 */
import { useMemo, useRef, useState } from 'react';
import { BD, BL, CHECKLIST, PAST, PROFILE, SOURCES, STAGES, STATS, TENDERS, WEEKS, type Tender } from './demo-data';

type Plan = 'trial' | 'sub';
type Row = { id: string; title: string; ref: string; src: string; prov: string; closesShort: string; score: number };
const RT = { y: 'You have it', q: 'Could not confirm', n: 'You do not have it' } as const;
const TODAY = '2026-10-26';

export function TenderDemo({ plan, id }: { plan: Plan; id: string }) {
  const sub = plan === 'sub';
  const tenders = useMemo(() => TENDERS.filter((t) => sub || t.trial), [sub]);
  const rows: Row[] = useMemo(() => (sub ? [...TENDERS, ...PAST] : TENDERS.filter((t) => t.trial)), [sub]);

  const [view, setView] = useState<'email' | 'dash'>('email');
  const [stage, setStage] = useState<Record<string, string>>(() => Object.fromEntries([...TENDERS.map((t) => [t.id, 'Received']), ...PAST.map((p) => [p.id, p.stage])]));
  const [notes, setNotes] = useState<Record<string, string>>(() => Object.fromEntries(PAST.map((p) => [p.id, p.note ?? ''])));
  const [subDates, setSubDates] = useState<Record<string, string>>(() => Object.fromEntries(PAST.map((p) => [p.id, p.sub ?? ''])));
  const [checks, setChecks] = useState<Record<string, boolean[]>>({});
  const [sel, setSel] = useState<string>(sub ? 't1' : 't1');
  const [toast, setToast] = useState('');
  const [tip, setTip] = useState<{ x: number; y: number; html: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const say = (m: string) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3200); };
  const mark = (tid: string, s: string) => {
    setStage((x) => ({ ...x, [tid]: s }));
    if (s === 'Submitted') setSubDates((x) => ({ ...x, [tid]: x[tid] || TODAY }));
    setChecks((x) => { const n = { ...x }; delete n[tid]; return n; });
    setSel(tid);
    say(`Marked as ${s === 'Submitted' ? 'applied' : s.toLowerCase()}. Open the Dashboard tab to see the row.`);
  };
  const rank = (t: Tender) => [...tenders].sort((a, b) => b.score - a.score || tenders.indexOf(a) - tenders.indexOf(b)).indexOf(t) + 1;

  const checklist = (rid: string) => {
    const t = TENDERS.find((x) => x.id === rid);
    return t && /^Compulsory/.test(t.brief) ? [...CHECKLIST, 'Briefing attendance certificate'] : CHECKLIST;
  };
  const checkState = (rid: string) => {
    if (checks[rid]) return checks[rid];
    const L = checklist(rid), st = stage[rid];
    const n = st === 'Received' || st === 'Not applying' ? 0 : st === 'Preparing' ? 4 : L.length;
    return L.map((_, i) => i < n);
  };

  const showTip = (e: React.MouseEvent, html: string) => {
    let x = e.clientX + 14; const y = e.clientY + 14;
    if (x + 250 > window.innerWidth) x = e.clientX - 250;
    setTip({ x, y, html });
  };
  const tipProps = (html: string) => ({ onMouseMove: (e: React.MouseEvent) => showTip(e, html), onMouseLeave: () => setTip(null) });

  return (
    <div className="tdemo" id={id}>
      <div className="tdemo__tabs" role="group" aria-label="Show">
        <button type="button" aria-pressed={view === 'email'} onClick={() => setView('email')}>Email</button>
        <button type="button" aria-pressed={view === 'dash'} onClick={() => setView('dash')}>Dashboard</button>
      </div>

      {view === 'email' ? (
        <Email plan={plan} tenders={tenders} stage={stage} rank={rank} onMark={mark} onPay={() => say('Demo only. In the real email this opens the payment page.')} />
      ) : (
        <Dashboard
          plan={plan} rows={rows} stage={stage} notes={notes} subDates={subDates} sel={sel}
          checklist={checklist} checkState={checkState} tipProps={tipProps}
          onSelect={setSel}
          onStage={(rid, s) => { setStage((x) => ({ ...x, [rid]: s })); if (s === 'Submitted') setSubDates((x) => ({ ...x, [rid]: x[rid] || TODAY })); setChecks((x) => { const n = { ...x }; delete n[rid]; return n; }); setSel(rid); }}
          onNote={(rid, v) => setNotes((x) => ({ ...x, [rid]: v }))}
          onDate={(rid, v) => setSubDates((x) => ({ ...x, [rid]: v }))}
          onCheck={(rid, i, v) => setChecks((x) => { const cur = [...checkState(rid)]; cur[i] = v; return { ...x, [rid]: cur }; })}
          onPay={() => say('Demo only. In the real dashboard this opens the payment page.')}
        />
      )}

      {tip && <div className="tdemo__tip" style={{ left: tip.x, top: tip.y }} dangerouslySetInnerHTML={{ __html: tip.html }} />}
      <div className="tdemo__toast" role="status" aria-live="polite" hidden={!toast}>{toast}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ email */

function Email({ plan, tenders, stage, rank, onMark, onPay }: { plan: Plan; tenders: Tender[]; stage: Record<string, string>; rank: (t: Tender) => number; onMark: (id: string, s: string) => void; onPay: () => void }) {
  const sub = plan === 'sub';
  return (
    <section className="tmail" aria-label={sub ? 'Sample subscriber email' : 'Sample free-week email'}>
      <div className="tmail__head">
        <div className="tmail__subj">{sub ? '6 tenders scored 90 or higher in this update' : 'Your first TenderIQ matches: 1 tender scored 90 or higher'}</div>
        <div className="tmail__row"><span>From <b>TenderIQ</b></span><span>To <b>Thandi Mokoena, Dube &amp; Mokoena Civil Works</b></span><span>Mon 26 Oct 2026, 05:00</span></div>
      </div>
      <div className="tmail__canvas"><div className="tmail__mail">
        <div className="m-top"><div className="wm">TENDER<span>IQ</span></div><div className="dt">{sub ? 'TENDER UPDATE' : 'FREE WEEK · FIRST MATCHES'} · MON 26 OCT 2026</div></div>
        <div className="m-body">
          <h3>Hi Thandi,</h3>
          <p>
            {sub ? <>We scanned <b>436 new tenders</b> across 7 sources since your last update, shortlisted 15 and read their documents in full. <b>6</b> scored 90 or higher for your company.</>
              : <>We scanned <b>187 new tenders</b> on eTenders, shortlisted 4 and read their documents in full. <b>1</b> scored 90 or higher for your company.</>}
            {' '}They are listed by closing date. Each card shows what is needed, what you are missing and where to submit.
          </p>
          <div className="strip"><span>{sub ? 'Subscription renews Sat 14 Nov 2026 · 19 days left' : 'Free week ends Fri 30 Oct 2026 · 4 days left'}</span><button type="button" className="tbtn tbtn--gold" onClick={onPay}>{sub ? 'Pay early' : 'Subscribe now'}</button></div>
          {!sub && <div className="locked-note"><b>Your free week searches eTenders only.</b> Provincial and municipal portals, state-owned companies and private RFQ boards switch on after your first payment.</div>}
          <div className="m-wrapx"><table className="m-glance"><thead><tr><th>Score</th><th>Tender</th><th>Type</th><th>Closes</th></tr></thead><tbody>
            {tenders.map((t) => <tr key={t.id}><td className="mono">{t.score}</td><td><b>{t.title}</b><br /><span className="mut">{t.src}</span></td><td>{t.kind.replace(' (state-owned)', '')}</td><td className="mono nowrap">{t.closesShort}</td></tr>)}
          </tbody></table></div>
        </div>
        <div className="m-cards">{tenders.map((t, i) => <Card key={t.id} t={t} i={i} st={stage[t.id]} rank={rank(t)} total={tenders.length} onMark={onMark} />)}</div>
        <div className="m-foot">Mark each tender with the buttons on its card so we stop sending it again. Tenders you mark as applied or not applying are not repeated. Majesty Method, TenderIQ.</div>
      </div></div>
    </section>
  );
}

function Card({ t, i, st, rank, total, onMark }: { t: Tender; i: number; st: string; rank: number; total: number; onMark: (id: string, s: string) => void }) {
  const acts: [string, string][] = [['I applied', 'Submitted'], ['I’m preparing', 'Preparing'], ['Not applying', 'Not applying']];
  return (
    <article className={`tcard c${i % 4}`}>
      <div className="th">
        <div>
          <div className="tags"><span className="pill solid">{t.src}</span><span className="pill">{t.kind}</span>{t.provisional && <span className="pill">Provisional</span>}</div>
          <h4 className="tt">{t.title}</h4>
        </div>
        <div className="big"><div className="n">{t.score}<small>/100</small></div><div className="rk">{total > 1 ? `Ranked ${rank} of ${total} this update` : 'Your top match this update'}</div></div>
      </div>
      <div className="sec"><h5><i>1</i>The opportunity</h5><dl className="kv">
        <dt>They want</dt><dd>{t.what}</dd><dt>Issuer</dt><dd>{t.issuer}</dd><dt>Where</dt><dd>{t.place}</dd><dt>Platform</dt><dd>{t.src}</dd><dt>Budget</dt><dd>{t.budget}</dd><dt>Reference</dt><dd className="mono">{t.ref}</dd>
      </dl></div>
      <div className="sec"><h5><i>2</i>Tender requirements</h5><ul className="reqs">
        {t.req.map(([k, txt]) => <li key={txt}><span className={`rtag${k === 'n' ? ' n' : ''}`}>{RT[k]}</span><span>{txt}</span></li>)}
      </ul></div>
      <div className="two">
        <div className="sec"><h5><i>3</i>What you are missing</h5>
          <p className="small"><b>You are missing:</b> {t.missing.length ? t.missing.join('; ') + '.' : 'nothing we could find.'}</p>
          <p className="small"><b>Please confirm:</b> {t.confirm.join(' ')}</p>
        </div>
        <div className="sec"><h5><i>4</i>Closing and submission</h5><dl className="kv">
          <dt>Closes</dt><dd><b>{t.closes}</b></dd><dt>Submit</dt><dd>{t.submit}</dd><dt>Instructions</dt><dd>{t.instr}</dd><dt>Briefing</dt><dd>{t.brief}</dd>
        </dl></div>
      </div>
      <div className="sec"><h5><i>5</i>Ranking: {t.score} out of 100</h5>
        <div className="bars">{t.bd.map((v, k) => <div key={k}><span>{BL[k]}</span><span className="tr"><b style={{ width: `${(v / BD[k]) * 100}%` }} /></span><span>{v}/{BD[k]}</span></div>)}</div>
        <p className="small">{t.why}</p>
      </div>
      <div className="acts">
        {acts.map(([label, s]) => <button type="button" key={s} aria-pressed={st === s} onClick={() => onMark(t.id, s)}>{label}</button>)}
        {st !== 'Received' && <span className="res">Marked {st}. Your dashboard row now shows it.</span>}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ dashboard */

type TipProps = (html: string) => { onMouseMove: (e: React.MouseEvent) => void; onMouseLeave: () => void };

function Dashboard(p: {
  plan: Plan; rows: Row[]; stage: Record<string, string>; notes: Record<string, string>; subDates: Record<string, string>; sel: string;
  checklist: (id: string) => string[]; checkState: (id: string) => boolean[]; tipProps: TipProps;
  onSelect: (id: string) => void; onStage: (id: string, s: string) => void; onNote: (id: string, v: string) => void; onDate: (id: string, v: string) => void;
  onCheck: (id: string, i: number, v: boolean) => void; onPay: () => void;
}) {
  const sub = p.plan === 'sub';
  const d = STATS[p.plan];
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const tr = sum(d.recv), ta = sum(d.app), days = sub ? 19 : 4, tot = sub ? 30 : 7;
  const selRow = p.rows.find((r) => r.id === p.sel) ?? p.rows[0];
  const L = p.checklist(selRow.id), cs = p.checkState(selRow.id), done = cs.filter(Boolean).length;
  const pm = Math.max(...d.prov.map((x) => x[1]));
  const tot2 = d.pub + d.priv;

  return (
    <section className="tdash" aria-label={sub ? 'Sample subscriber dashboard' : 'Sample free-week dashboard'}>
      <div className="sheethead"><div><h3 className="tdash__h1">Dube &amp; Mokoena Civil Works</h3><p>Client C007 · Contact Thandi Mokoena · Updates twice a week</p></div></div>

      <div className="panel"><div className="subbar">
        <Ring days={days} total={tot} />
        <div>
          <h4>{sub ? 'Subscription active' : 'Free week'}</h4>
          <p>{sub ? 'Paid through Sat 14 Nov 2026. Renews on the 14th of each month at R1,500.' : 'Ends Fri 30 Oct 2026. Then R1,500 a month, pro-rated for the first period.'}</p>
          <p>{sub ? 'Searching 7 sources.' : 'Searching eTenders only. Other platforms switch on after payment.'}</p>
        </div>
        <div className="payb"><button type="button" className="tbtn" onClick={p.onPay}>{sub ? 'Pay early' : 'Subscribe now'}</button><small>EFT or Ozow</small></div>
      </div></div>

      <div className="kpis">
        <div className="kpi"><div className="l">Received</div><div className="v">{tr}</div><div className="d">since 7 Sep</div></div>
        <div className="kpi"><div className="l">Applied</div><div className="v">{ta}</div><div className="d">{tr ? Math.round((ta / tr) * 100) : 0}% of received</div></div>
        <div className="kpi"><div className="l">Awaiting result</div><div className="v">{d.wait}</div><div className="d">under evaluation</div></div>
        <div className="kpi"><div className="l">Awarded</div><div className="v">{d.won}</div><div className="d">contracts won</div></div>
      </div>

      <div className="charts">
        <div className="panel chart"><h4>Received and applied</h4><p className="sub">Tenders per week</p>
          <div className="legend"><span><i style={{ background: 'var(--td-accent)' }} />Received</span><span><i style={{ background: 'var(--td-gold)' }} />Applied</span></div>
          <WeekChart recv={d.recv} app={d.app} tipProps={p.tipProps} />
        </div>
        <div className="panel"><h4>Public and private</h4><p className="sub">Where your tenders come from</p>
          <div className="pstack">
            {d.pub > 0 && <b className="pub" style={{ flex: d.pub }} {...p.tipProps(`Public: ${d.pub}`)}>{d.pub}</b>}
            {d.priv > 0 && <b className="priv" style={{ flex: d.priv }} {...p.tipProps(`Private: ${d.priv}`)}>{d.priv}</b>}
          </div>
          <div className="legend"><span><i style={{ background: 'var(--td-accent)' }} />Public {Math.round((d.pub / tot2) * 100)}%</span><span><i style={{ background: 'var(--td-gold)' }} />Private {Math.round((d.priv / tot2) * 100)}%</span></div>
          <h4 style={{ marginTop: 18 }}>By province</h4><p className="sub">Tenders received</p>
          <div className="hb">{d.prov.map(([name, n]) => <div key={name} {...p.tipProps(`${name}: ${n} tenders`)}><span>{name}</span><span className="tr"><b style={{ width: `${(n / pm) * 100}%` }} /></span><span>{n}</span></div>)}</div>
        </div>
      </div>

      <div className="panel"><h4>Tenders</h4><p className="sub">Latest tenders, newest first. Click a row for its document checklist.</p>
        <div className="tbl"><table className="t">
          <thead><tr><th>Tender</th><th>Source</th><th>Province</th><th>Closes</th><th>Score</th><th>Stage</th><th>Submitted on</th><th>Notes</th></tr></thead>
          <tbody>{p.rows.map((r) => (
            <tr key={r.id} className={`row${r.id === selRow.id ? ' sel' : ''}`} onClick={(e) => { if (!/SELECT|INPUT|OPTION/.test((e.target as HTMLElement).tagName)) p.onSelect(r.id); }}>
              <td><div className="tt">{r.title}</div><div className="rf">{r.ref}</div></td><td>{r.src}</td><td>{r.prov}</td><td className="mono nowrap">{r.closesShort}</td><td><span className="score">{r.score}</span></td>
              <td><select className="st" data-s={p.stage[r.id]} value={p.stage[r.id]} aria-label={`Stage for ${r.title}`} onChange={(e) => p.onStage(r.id, e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></td>
              <td><input className="in" type="date" value={p.subDates[r.id] || ''} aria-label={`Submitted on, ${r.title}`} onChange={(e) => p.onDate(r.id, e.target.value)} /></td>
              <td><input className="in" type="text" value={p.notes[r.id] || ''} placeholder="Add a note" aria-label={`Notes, ${r.title}`} onChange={(e) => p.onNote(r.id, e.target.value)} /></td>
            </tr>
          ))}</tbody>
        </table></div>
        <p className="editnote">You can edit Stage, Submitted on and Notes. Everything else is kept up to date by TenderIQ.</p>
      </div>

      <div className="panel">
        <div className="sheethead"><div><h4>Documents for this tender</h4><p className="sub" style={{ margin: '2px 0 0' }}>{selRow.title}</p></div><span className="prog">{done} of {L.length} ready</span></div>
        <div className="chk">{L.map((x, i) => <label key={x}><input type="checkbox" checked={!!cs[i]} onChange={(e) => p.onCheck(selRow.id, i, e.target.checked)} />{x}</label>)}</div>
      </div>

      <div className="panel"><h4>Sources scanned in this update</h4>
        <p className="sub">{sub ? 'New tenders found on each platform. All are checked against your profile.' : 'Your free week searches eTenders only. The other platforms switch on after your first payment.'}</p>
        <div className="srcs">{SOURCES.map(([name, n, free]) => { const on = sub || free; return (
          <div key={name} className={`src${on ? '' : ' off'}`}><div><b>{name}</b><small>{on ? 'Scanned Mon 05:00' : 'Locked'}</small></div><div className="n">{on ? n : 'After payment'}</div></div>
        ); })}</div>
      </div>

      <div className="panel"><h4>Company profile</h4><p className="sub">What TenderIQ uses to match. Each value shows where it came from and how sure we are.</p>
        <div className="tbl"><table className="ptbl"><thead><tr><th>Section</th><th>Field</th><th>Value</th><th>Source</th><th>Confidence</th></tr></thead><tbody>
          {PROFILE.map((r) => <tr key={r[1]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><span className={`cf ${r[4]}`}>{r[4]}</span></td></tr>)}
        </tbody></table></div>
        <div className="gaps"><b>Gaps and conflicts we found</b><ul>
          <li>Your form says minimum contract R1m, but your profile PDF lists R500k projects. We used R1m.</li>
          <li>CSD report date is missing. Tenders that ask for it are marked Provisional.</li>
        </ul></div>
      </div>
    </section>
  );
}

function Ring({ days, total }: { days: number; total: number }) {
  const r = 34, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, days / total));
  return (
    <div className="ring">
      <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`${days} days remaining`}>
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--td-surface2)" strokeWidth="9" />
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--td-accent)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * f} ${c}`} transform="rotate(-90 42 42)" />
      </svg>
      <div className="c"><div>{days}<small>days left</small></div></div>
    </div>
  );
}

function WeekChart({ recv, app, tipProps }: { recv: number[]; app: number[]; tipProps: TipProps }) {
  const W = 600, H = 230, pl = 28, pr = 6, pt = 14, pb = 28;
  const mx = Math.max(4, Math.ceil(Math.max(...recv) / 2) * 2), iw = W - pl - pr, ih = H - pt - pb, n = recv.length, slot = iw / n, bw = Math.min(20, slot / 3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tenders received and applied by week">
      {[0, 1, 2, 3, 4].map((i) => { const y = pt + ih - (ih * i) / 4; return <g key={i}><line x1={pl} x2={W - pr} y1={y} y2={y} stroke="var(--td-line)" /><text x={pl - 6} y={y + 4} textAnchor="end">{(mx * i) / 4}</text></g>; })}
      {recv.map((v, k) => {
        const cx = pl + slot * k + slot / 2, h1 = (ih * v) / mx, h2 = (ih * app[k]) / mx;
        return (
          <g key={k} {...tipProps(`<b>Week of ${WEEKS[k]}</b><br>Received ${v}<br>Applied ${app[k]}`)}>
            <rect x={cx - slot / 2} y={pt} width={slot} height={ih} fill="transparent" />
            {v > 0 && <><rect x={cx - bw - 1} y={pt + ih - h1} width={bw} height={h1} rx="3" fill="var(--td-accent)" /><text x={cx - bw / 2 - 1} y={pt + ih - h1 - 4} textAnchor="middle">{v}</text></>}
            {app[k] > 0 && <><rect x={cx + 1} y={pt + ih - h2} width={bw} height={h2} rx="3" fill="var(--td-gold)" /><text x={cx + bw / 2 + 1} y={pt + ih - h2 - 4} textAnchor="middle">{app[k]}</text></>}
            <text x={cx} y={H - 8} textAnchor="middle">{WEEKS[k]}</text>
          </g>
        );
      })}
    </svg>
  );
}
