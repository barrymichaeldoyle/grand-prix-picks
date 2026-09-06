import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect';

/**
 * Slide the children of a container from where they were to where they now
 * are, whenever a re-render only reordered them.
 *
 * A live session's board is the same rows and the same five driver cells
 * every tick — a position swap is the only thing that changed. Rendered
 * straight, that reads as the whole block flashing and redrawing, which hides
 * the one fact worth seeing: who went past whom. Measured before and after and
 * animated across, it reads as the overtake it is.
 *
 * FLIP, so the layout is never faked: React lands the new order, we measure
 * it, then transform each element back to its old box and let it play forwards
 * to zero. Positions come from `offsetTop`/`offsetLeft`, which are layout
 * facts and so unaffected by a transform still in flight; that in-flight
 * offset is read separately off the computed matrix and folded in, so an
 * update arriving mid-slide continues from where the element visually is
 * rather than snapping back to its last settled row.
 *
 * Mark each child with `data-flip-key` (a stable identity, not an index). A
 * key seen for the first time is not animated: it entered, it did not move.
 */
export function useReorderFlip<T extends HTMLElement>(enabled = true) {
  const containerRef = useRef<T>(null);
  const previous = useRef(new Map<string, { top: number; left: number }>());

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const before = previous.current;
    const after = new Map<string, { top: number; left: number }>();
    /* Feature-detected rather than assumed: the Web Animations API and
       `matchMedia` are both absent under jsdom, where every consumer of this
       hook is unit-tested. */
    const animate =
      enabled &&
      typeof window.matchMedia === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (const child of container.querySelectorAll<HTMLElement>(
      '[data-flip-key]',
    )) {
      const key = child.dataset.flipKey;
      if (!key) {
        continue;
      }
      const box = { top: child.offsetTop, left: child.offsetLeft };
      after.set(key, box);

      const was = before.get(key);
      if (!was || !animate || typeof child.animate !== 'function') {
        continue;
      }
      const drift = inFlightTranslate(child);
      const dx = was.left + drift.x - box.left;
      const dy = was.top + drift.y - box.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        continue;
      }

      if (typeof child.getAnimations === 'function') {
        for (const animation of child.getAnimations()) {
          animation.cancel();
        }
      }
      child.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0px, 0px)' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }

    previous.current = after;
  });

  return containerRef;
}

/** Where a still-running slide has the element right now, relative to its box. */
function inFlightTranslate(el: HTMLElement) {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === 'none') {
    return { x: 0, y: 0 };
  }
  try {
    const matrix = new DOMMatrixReadOnly(transform);
    return { x: matrix.m41, y: matrix.m42 };
  } catch {
    return { x: 0, y: 0 };
  }
}
