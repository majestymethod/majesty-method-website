import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/** Renders admin-authored Markdown. Output is sanitised even though only admins can edit it. */
export function Markdown({ source, vars, className }: { source: string; vars?: Record<string, string>; className?: string }) {
  const filled = vars ? source.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m)) : source;
  const html = sanitizeHtml(marked.parse(filled, { async: false, gfm: true }) as string, {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'blockquote', 'code'],
    allowedAttributes: { a: ['href', 'rel', 'target'] },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href || '');
        return { tagName: 'a', attribs: external ? { ...attribs, rel: 'noopener noreferrer' } : attribs };
      },
    },
  });
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
