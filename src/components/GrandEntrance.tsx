'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import L from './entrance-layout.json';

/*
  The Grand Entrance. Every layer is cut from the owner's artwork and positioned in the image's own
  coordinate space (1672×940) inside a "stage" that covers the viewport like background-size: cover.
  Closed, the layers recompose the original picture exactly. Opening: the seal lifts, the ribbon parts,
  the door leaves slide into the walls, and two portals appear in the lit doorway.
*/

type State = 'closed' | 'opening' | 'open';
interface Props {
  heading: string;
  cue: string;
  choicePrompt: string;
  majesty: { label: string; description: string };
  tenderiq: { label: string; description: string };
}

const px = (v: number) => `${(v / L.width) * 100}%`;
const py = (v: number) => `${(v / L.height) * 100}%`;
const box = (b: { x: number; y: number; w: number; h: number }) => ({ left: px(b.x), top: py(b.y), width: px(b.w), height: py(b.h) });
const inBox = (b: { x: number; y: number; w: number; h: number }, parent: { x: number; y: number; w: number; h: number }) => ({
  left: `${((b.x - parent.x) / parent.w) * 100}%`, top: `${((b.y - parent.y) / parent.h) * 100}%`,
  width: `${(b.w / parent.w) * 100}%`, height: `${(b.h / parent.h) * 100}%`,
});
const KEY = 'mm-entrance-opened';
const RIBBON_HIT = { x: 423, y: 418, w: 830, h: 134 };

export function GrandEntrance({ heading, cue, choicePrompt, majesty, tenderiq }: Props) {
  const [state, setState] = useState<State>('closed');
  const [instant, setInstant] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firstChoice = useRef<HTMLAnchorElement>(null);
  const timer = useRef<number | null>(null);

  const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Returning in the same session (e.g. pressing Back): show the open entrance straight away.
  useEffect(() => {
    setMounted(true);
    try { if (sessionStorage.getItem(KEY) === '1') { setInstant(true); setState('open'); } } catch { /* storage unavailable */ }
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  const open = useCallback((skip = false) => {
    if (state !== 'closed') return;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    if (skip || reduced()) {
      setInstant(true);
      setState('open');
      requestAnimationFrame(() => firstChoice.current?.focus({ preventScroll: true }));
      return;
    }
    setState('opening');
    timer.current = window.setTimeout(() => {
      setState('open');
      firstChoice.current?.focus({ preventScroll: true });
    }, 1500);
  }, [state]);

  const closed = state === 'closed';
  return (
    <section className="gx" data-state={state} data-instant={instant || undefined} aria-labelledby="gx-heading">
      <h1 id="gx-heading" className="visually-hidden">{heading}</h1>
      <a href="#gx-choices" className="skip-link" onClick={(e) => { e.preventDefault(); open(true); }}>Skip to the choices</a>

      <div className="gx-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gx-base" src="/entrance/base-1672.webp" srcSet="/entrance/base-1100.webp 1100w, /entrance/base-1672.webp 1672w"
          sizes="max(100vw, 178svh)" width={L.width} height={L.height} alt="" fetchPriority="high" decoding="async" />
        <div className="gx-glow" style={box(L.archBox)} aria-hidden="true" />

        <div className="gx-doors" style={box(L.archBox)} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gx-leaf gx-leaf--l" src="/entrance/leaf-l.webp" alt="" fetchPriority="high" style={inBox(L.leafL, L.archBox)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gx-leaf gx-leaf--r" src="/entrance/leaf-r.webp" alt="" fetchPriority="high" style={inBox(L.leafR, L.archBox)} />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gx-ribbon gx-ribbon--l" src="/entrance/ribbon-l.webp" alt="" style={box(L.ribbonL)} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gx-ribbon gx-ribbon--r" src="/entrance/ribbon-r.webp" alt="" style={box(L.ribbonR)} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gx-seal" src="/entrance/seal.webp" alt="" style={box(L.sealBox)} aria-hidden="true" />

        <button
          type="button"
          className="gx-ribbon-btn"
          style={box(RIBBON_HIT)}
          onClick={() => open()}
          aria-label={`${cue}. Opens the entrance and shows the two destinations.`}
          tabIndex={closed ? 0 : -1}
          aria-hidden={!closed}
        />
        <span className="gx-seal-ring" style={box({ x: L.seal.cx - L.seal.r - 10, y: L.seal.cy - L.seal.r - 10, w: (L.seal.r + 10) * 2, h: (L.seal.r + 10) * 2 })} aria-hidden="true" />
        <p className="gx-cue" style={{ left: px(L.seal.cx), top: py(L.seal.cy + L.seal.r + 22) }} aria-hidden="true">{cue}</p>

        <div id="gx-choices" className="gx-choices" style={box({ x: L.door.x0 + 18, y: 250, w: L.door.x1 - L.door.x0 - 36, h: 470 })} inert={mounted && closed}>
          <p className="gx-prompt">{choicePrompt}</p>
          <div className="gx-portals">
            <Link href="/majesty-method" className="gx-portal gx-portal--mm" ref={firstChoice}>
              <span className="gx-portal__name">{majesty.label}</span>
              <span className="gx-portal__rule" aria-hidden="true" />
              <span className="gx-portal__desc">{majesty.description}</span>
              <span className="gx-portal__enter" aria-hidden="true">Enter</span>
            </Link>
            <Link href="/tenderiq" className="gx-portal gx-portal--tiq">
              <span className="gx-portal__name">{tenderiq.label}</span>
              <span className="gx-portal__rule" aria-hidden="true" />
              <span className="gx-portal__desc">{tenderiq.description}</span>
              <span className="gx-portal__enter" aria-hidden="true">Enter</span>
            </Link>
          </div>
        </div>
      </div>
      <noscript>
        <style>{'.gx-choices{opacity:1!important;visibility:visible!important;transform:none!important}.gx-leaf,.gx-ribbon,.gx-seal,.gx-cue,.gx-ribbon-btn,.gx-seal-ring{display:none!important}.gx-glow{opacity:1!important}'}</style>
      </noscript>
    </section>
  );
}
