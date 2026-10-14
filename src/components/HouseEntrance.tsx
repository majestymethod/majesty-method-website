'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import L from './house-layout.json';

/*
  The House of Majesty entrance.

  Outside: the owner's exterior artwork, rebuilt from layers cut out of it (a ribbon-free base, the two
  glass door leaves, the two ribbon halves and the seal) so the closed state looks exactly like the artwork.

  Opening (about 2 seconds; instant with reduced motion):
    ribbon  – the seal presses and lifts away, the ribbon halves release outward
    doors   – the glass doors slide into the walls; the interior artwork is visible through the gap
    push    – the camera moves through the doorway: the exterior scales up around the door while the
              interior expands from the door opening to fill the screen
    open    – the two pathways are live links (Majesty Method → /majesty-method, TenderIQ → /tenderiq)

  On narrow/portrait screens the interior becomes two stacked panels, each a crop of its own pathway.
*/

type Phase = 'closed' | 'ribbon' | 'doors' | 'push' | 'open' | 'leaving';
type Box = { x: number; y: number; w: number; h: number };
interface Brand { label: string; description: string }
interface Props { heading: string; cue: string; choicePrompt: string; returnLabel: string; majesty: Brand; tenderiq: Brand }

const KEY = 'mm-entrance-opened';
const T = { doors: 420, push: 1150, open: 2150 };
const IW = L.interior.width;
const IH = L.interior.height;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const extBox = (b: Box): CSSProperties => ({ left: pct(b.x, L.width), top: pct(b.y, L.height), width: pct(b.w, L.width), height: pct(b.h, L.height) });
const intBox = (b: Box): CSSProperties => ({ left: pct(b.x, IW), top: pct(b.y, IH), width: pct(b.w, IW), height: pct(b.h, IH) });
const within = (b: Box, p: Box): CSSProperties => ({ left: pct(b.x - p.x, p.w), top: pct(b.y - p.y, p.h), width: pct(b.w, p.w), height: pct(b.h, p.h) });
const polygonIn = (pts: number[][], p: Box) => `polygon(${pts.map(([x, y]) => `${pct(x - p.x, p.w)} ${pct(y - p.y, p.h)}`).join(', ')})`;

const RIBBON_HIT: Box = { x: 498, y: 484, w: 677, h: 98 };
const SRCSET_INT = '/house/int-800.webp 800w, /house/int-1100.webp 1100w, /house/int-1672.webp 1672w';

function Pathway({ id, brand, href, refEl, loaded, active }: {
  id: 'mm' | 'tiq'; brand: Brand; href: string; refEl?: React.Ref<HTMLAnchorElement>; loaded: boolean; active: boolean;
}) {
  const g = L.interior[id];
  const hit = g.hit as Box;
  return (
    <Link href={href} ref={refEl} className={`hx-path hx-path--${id}${active ? ' is-active' : ''}`} style={{ ...intBox(hit), ['--fx' as string]: g.focus.x, ['--fy' as string]: g.focus.y }}>
      {/* Portrait: this pathway's own crop of the interior artwork */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {loaded ? <img className="hx-path__crop" src="/house/int-1672.webp" srcSet={SRCSET_INT} sizes="200vw" alt="" decoding="async" /> : <span className="hx-path__crop" />}
      <span className="hx-chip" style={{ left: pct(g.chip.x - hit.x, hit.w), top: pct(g.chip.y - hit.y, hit.h) }}>
        <span className="visually-hidden">{brand.label}: </span>
        <span className="hx-chip__desc">{brand.description}</span>
        <span className="hx-chip__enter">Enter <span aria-hidden="true">→</span></span>
      </span>
    </Link>
  );
}

const FULL: Box = { x: 0, y: 0, w: L.interior.width, h: L.interior.height };
/** The lit sign, doorway and runner of one pathway (shown on hover/focus, or when it is in view on a phone). */
function Lights({ id }: { id: 'mm' | 'tiq' }) {
  const g = L.interior[id];
  return (
    <>
      <span className={`hx-light hx-light--${id} hx-light--sign`} style={intBox(g.sign as Box)} aria-hidden="true" />
      <span className={`hx-light hx-light--${id} hx-light--door`} style={intBox(g.door as Box)} aria-hidden="true" />
      <span className={`hx-light hx-light--${id} hx-light--carpet`} style={{ inset: 0, clipPath: polygonIn(g.carpet, FULL) }} aria-hidden="true" />
    </>
  );
}

type View = 'mm' | 'both' | 'tiq';
const VIEWS: View[] = ['mm', 'both', 'tiq'];

export function HouseEntrance({ heading, cue, choicePrompt, returnLabel, majesty, tenderiq }: Props) {
  const [phase, setPhase] = useState<Phase>('closed');
  const [instant, setInstant] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadInterior, setLoadInterior] = useState(false);
  const root = useRef<HTMLElement>(null);
  const aperture = useRef<HTMLDivElement>(null);
  const firstPath = useRef<HTMLAnchorElement>(null);
  const ribbonBtn = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setMounted(true);
    let opened = false;
    try { opened = sessionStorage.getItem(KEY) === '1'; } catch { /* storage unavailable */ }
    if (opened) { setInstant(true); setLoadInterior(true); setPhase('open'); }
    else {
      // Fetch the interior once the entrance itself has loaded, so it never competes with the first paint.
      const go = () => setLoadInterior(true);
      const t = window.setTimeout(go, 1800);
      window.addEventListener('pointerdown', go, { once: true });
      return () => { window.clearTimeout(t); window.removeEventListener('pointerdown', go); clearTimers(); };
    }
    return clearTimers;
  }, []);

  /** Records the doorway's on-screen rectangle so the interior can open exactly from it. */
  const measure = () => {
    const el = root.current, ap = aperture.current;
    if (!el || !ap) return;
    const r = ap.getBoundingClientRect();
    const s = el.getBoundingClientRect();
    const top = r.top - s.top, left = r.left - s.left, right = s.right - r.right, bottom = s.bottom - r.bottom;
    const cx = left + r.width / 2;
    const v = (k: string, n: number) => el.style.setProperty(k, `${Math.round(n)}px`);
    v('--hx-t', top); v('--hx-l', left); v('--hx-r', right); v('--hx-b', bottom);
    v('--hx-cl', cx); v('--hx-cr', s.width - cx);
    v('--hx-ox', cx); v('--hx-oy', top + r.height / 2);
  };

  const finish = useCallback((focus = true) => {
    clearTimers();
    setPhase('open');
    if (focus) requestAnimationFrame(() => firstPath.current?.focus({ preventScroll: true }));
  }, []);

  const open = useCallback((skip = false) => {
    if (phase !== 'closed') return;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    setLoadInterior(true);
    if (skip || reduced()) { setInstant(true); finish(); return; }
    setInstant(false);
    measure();
    requestAnimationFrame(() => {
      setPhase('ribbon');
      timers.current.push(
        window.setTimeout(() => setPhase('doors'), T.doors),
        window.setTimeout(() => setPhase('push'), T.push),
        window.setTimeout(() => finish(), T.open),
      );
    });
  }, [phase, finish]);

  const back = useCallback(() => {
    clearTimers();
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
    const reset = () => {
      setInstant(true);
      setPhase('closed');
      requestAnimationFrame(() => { requestAnimationFrame(() => setInstant(false)); ribbonBtn.current?.focus({ preventScroll: true }); });
    };
    if (reduced()) { reset(); return; }
    setInstant(false);
    setPhase('leaving');
    timers.current.push(window.setTimeout(reset, 450));
  }, []);

  // Escape (or a second click) skips the rest of the animation.
  useEffect(() => {
    if (phase === 'closed' || phase === 'open' || phase === 'leaving') return;
    const skip = (e: Event) => { if (e instanceof KeyboardEvent && e.key !== 'Escape') return; finish(); };
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => { window.removeEventListener('keydown', skip); window.removeEventListener('click', skip); };
  }, [phase, finish]);

  // Phones: the whole lobby with both pathways; slide (or use the arrows) to move closer to either side.
  const [view, setView] = useState<View>('both');
  const vi = VIEWS.indexOf(view);
  const step = useCallback((d: -1 | 1) => setView((v) => VIEWS[Math.min(2, Math.max(0, VIEWS.indexOf(v) + d))]), []);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY, moved: false }; };
  const onPointerUp = (e: React.PointerEvent) => {
    const s0 = swipe.current; if (!s0) return;
    const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { s0.moved = true; step(dx < 0 ? 1 : -1); }
  };
  const onClickCapture = (e: React.MouseEvent) => { if (swipe.current?.moved) { e.preventDefault(); e.stopPropagation(); } swipe.current = null; };
  useEffect(() => { if (phase === 'push' || phase === 'closed') setView('both'); }, [phase]);

  const closed = phase === 'closed';
  const interiorLive = phase === 'push' || phase === 'open';

  return (
    <section ref={root} className="hx" data-phase={phase} data-instant={instant || undefined} aria-labelledby="hx-heading">
      <h1 id="hx-heading" className="visually-hidden">{heading}</h1>
      <a href="#hx-paths" className="skip-link" onClick={(e) => { e.preventDefault(); open(true); }}>Skip to the two destinations</a>

      {/* ---------------- Outside ---------------- */}
      <div className="hx-ext" aria-hidden={!closed}>
        <div className="hx-stage hx-stage--ext">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hx-ext__base" src="/house/ext-1672.webp" srcSet="/house/ext-1100.webp 1100w, /house/ext-1672.webp 1672w"
            sizes="max(100vw, 178svh)" width={L.width} height={L.height} alt="" fetchPriority="high" decoding="async" />
          <div ref={aperture} className="hx-aperture" style={extBox(L.door)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hx-door hx-door--l" src="/house/door-l.webp" alt="" style={within(L.doorL, L.door)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hx-door hx-door--r" src="/house/door-r.webp" alt="" style={within(L.doorR, L.door)} />
            {/* The doors carry the artwork's own "Tap to enter", so tapping them opens the entrance too. */}
            <span className="hx-door-hit" onClick={() => open()} aria-hidden="true" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hx-ribbon hx-ribbon--l" src="/house/ribbon-l.webp" alt="" style={extBox(L.ribbonL)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hx-ribbon hx-ribbon--r" src="/house/ribbon-r.webp" alt="" style={extBox(L.ribbonR)} />
          <span className="hx-seal-glow" style={extBox({ x: L.seal.cx - L.seal.r - 14, y: L.seal.cy - L.seal.r - 14, w: (L.seal.r + 14) * 2, h: (L.seal.r + 14) * 2 })} aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hx-seal" src="/house/seal.webp" alt="" style={extBox(L.sealBox)} />
          <button ref={ribbonBtn} type="button" className="hx-ribbon-btn" style={extBox(RIBBON_HIT)}
            onClick={() => open()} tabIndex={closed ? 0 : -1}
            aria-label={`${cue}: open the ribbon and step inside to choose Majesty Method or TenderIQ`} />
        </div>
      </div>

      {/* ---------------- Inside ---------------- */}
      <div className="hx-int" inert={mounted && !interiorLive}>
        <div className="hx-int__bar">
          <button type="button" className="hx-back" onClick={back}><span aria-hidden="true">←</span> {returnLabel}</button>
          <h2 className="hx-prompt">{choicePrompt}</h2>
          <span className="hx-int__bar-spacer" aria-hidden="true" />
        </div>
        {/* Portrait screens: the full lobby is seen through the doorway, then it gives way to the two pathway panels. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {loadInterior ? <img className="hx-int__cover" src="/house/int-1672.webp" srcSet={SRCSET_INT} sizes="100vh" alt="" decoding="async" /> : null}
        <div className="hx-viewer" data-view={view} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onClickCapture={onClickCapture}>
          <span className="hx-viewer__blur" aria-hidden="true" />
          <div className="hx-stage hx-stage--int hx-visual" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {loadInterior
              ? <img className="hx-int__base" src="/house/int-1672.webp" srcSet={SRCSET_INT} sizes="max(100vw, 178svh)" width={IW} height={IH} alt="" decoding="async" draggable={false} />
              : <noscript><img className="hx-int__base" src="/house/int-1672.webp" width={IW} height={IH} alt="" /></noscript>}
            <Lights id="mm" />
            <Lights id="tiq" />
          </div>
          <div className="hx-stage hx-stage--int hx-paths" id="hx-paths">
            <Pathway id="mm" brand={majesty} href="/majesty-method" refEl={firstPath} loaded={loadInterior} active={view === 'mm'} />
            <Pathway id="tiq" brand={tenderiq} href="/tenderiq" loaded={loadInterior} active={view === 'tiq'} />
          </div>
        </div>
        {/* Phones only: slide between the whole lobby and a closer look at either pathway */}
        <div className="hx-pager">
          <button type="button" className="hx-pager__btn" onClick={() => step(-1)} disabled={vi === 0}
            aria-label={view === 'tiq' ? 'Back to both pathways' : `Slide towards ${majesty.label}`}><span aria-hidden="true">←</span></button>
          <div className="hx-pager__mid" aria-live="polite">
            <span className="hx-pager__dots" aria-hidden="true">{VIEWS.map((v) => <i key={v} data-on={view === v || undefined} data-v={v} />)}</span>
            <span className="hx-pager__hint">{view === 'both' ? 'Slide to explore' : view === 'mm' ? majesty.label : tenderiq.label}</span>
          </div>
          <button type="button" className="hx-pager__btn" onClick={() => step(1)} disabled={vi === 2}
            aria-label={view === 'mm' ? 'Back to both pathways' : `Slide towards ${tenderiq.label}`}><span aria-hidden="true">→</span></button>
        </div>
      </div>

      <noscript>
        <style>{'.hx-int{visibility:visible!important;opacity:1!important;clip-path:none!important}.hx-back{display:none}.hx-ext{visibility:hidden}'}</style>
      </noscript>
    </section>
  );
}
