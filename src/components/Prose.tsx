/** Renders editor text as paragraphs: a blank line starts a new paragraph. */
export function Prose({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const paras = (text || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  if (!paras.length) return null;
  return (
    <div className={`prose${className ? ` ${className}` : ''}`} style={style}>
      {paras.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

/** Two-digit step/topic number, e.g. 01. */
export const num = (i: number) => String(i + 1).padStart(2, '0');
