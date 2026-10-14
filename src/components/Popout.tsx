import type { ImageRef } from '@/lib/content/store';
import { Picture } from './Picture';

/** True when the image is a cut-out (background removed). Cut-outs are shown "popping out" of their box. */
export function isCutout(image: ImageRef | null | undefined) {
  return !!image?.id && image.id.endsWith('-cutout');
}

/**
 * A cut-out photo that pops out of a green box at the top and bottom.
 * - variant "bleed": sits inside a green panel and breaks out of the panel itself.
 * - variant "box": on a white background, draws its own green stone box behind the person.
 * `edge` says which side of a stacked phone layout the photo is on, so it pops out of that edge.
 */
export function Popout({ image, sizes, priority, variant = 'box', edge = 'bottom', className = '' }: { image: ImageRef; sizes: string; priority?: boolean; variant?: 'bleed' | 'box'; edge?: 'top' | 'bottom'; className?: string }) {
  return (
    <div className={`popout popout--${variant} popout--edge-${edge} ${className}`.trim()}>
      {variant === 'box' && <span className="popout__box" aria-hidden="true" />}
      <Picture image={image} sizes={sizes} priority={priority} className="popout__img" />
    </div>
  );
}
