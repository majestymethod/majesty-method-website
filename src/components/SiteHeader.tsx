'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

interface NavLink { label: string; href: string }
interface Props {
  brand: 'majesty' | 'tenderiq';
  homeHref: string;
  logoSrc: string | null;
  logoAlt: string;
  name: string;
  links: NavLink[];
  cta: NavLink | null;
}

export function SiteHeader({ brand, homeHref, logoSrc, logoAlt, name, links, cta }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={homeHref} className="brand-lockup">
          {brand === 'majesty' && logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" width={40} height={40} />
          )}
          {brand === 'tenderiq' && logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={logoAlt} style={{ width: 'auto', height: 36 }} />
          ) : (
            <span>
              <span className={brand === 'tenderiq' ? 'brand-lockup__name brand-lockup__name--tiq' : 'brand-lockup__name'}>{name}</span>
              {brand === 'tenderiq' && <span className="brand-lockup__by">by Majesty Method</span>}
            </span>
          )}
        </Link>
        <nav className="nav" aria-label={`${name} main`}>
          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {open ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" />}
            </svg>
            {open ? 'Close' : 'Menu'}
          </button>
          <div id={panelId} className="nav__panel" data-open={open}>
            <ul className="nav__list">
              {links.map((l) => {
                const current = l.href === pathname;
                return (
                  <li key={l.href + l.label}>
                    <Link href={l.href} aria-current={current ? 'page' : undefined} onClick={close}>{l.label}</Link>
                  </li>
                );
              })}
            </ul>
            {cta?.label && <Link href={cta.href} className="btn" onClick={close}>{cta.label}</Link>}
          </div>
        </nav>
      </div>
    </header>
  );
}
