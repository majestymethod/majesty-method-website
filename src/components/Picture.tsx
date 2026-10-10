import { getMedia } from '@/lib/media';
import type { ImageRef } from '@/lib/content/store';

interface Props {
  image: ImageRef | null | undefined;
  sizes?: string;
  priority?: boolean;
  className?: string;
  alt?: string; // overrides stored alt
  decorative?: boolean;
}

/** Responsive image from the media library. Renders nothing if the image is missing. */
export function Picture({ image, sizes = '100vw', priority, className, alt, decorative }: Props) {
  const m = getMedia(image?.id);
  if (!m || !m.variants.length) return null;
  const altText = decorative ? '' : (alt ?? image?.alt ?? m.alt ?? '');
  if (m.mime === 'image/svg+xml') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/media/${m.variants[0].file}`} alt={altText} className={className} loading={priority ? 'eager' : 'lazy'} decoding="async" />;
  }
  const largest = m.variants[m.variants.length - 1];
  const fallback = m.variants.find((v) => v.w >= 1080) ?? largest;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/media/${fallback.file}`}
      srcSet={m.variants.map((v) => `/media/${v.file} ${v.w}w`).join(', ')}
      sizes={sizes}
      width={largest.w}
      height={largest.h}
      alt={altText}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}
