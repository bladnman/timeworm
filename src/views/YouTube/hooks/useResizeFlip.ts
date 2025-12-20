import { useCallback, useRef, type RefObject } from 'react';
import { YOUTUBE_VIEW_CONFIG } from './constants';

interface UseResizeFlipOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  itemSelector: string;
}

/**
 * FLIP animation hook for smooth resize/zoom transitions.
 *
 * FLIP = First, Last, Invert, Play
 * 1. FIRST: Capture visual positions before change
 * 2. LAST: Get new positions after DOM update (in useLayoutEffect, before paint)
 * 3. INVERT: Apply transforms directly to DOM (before paint - no flash!)
 * 4. PLAY: Enable transitions and animate to final position
 *
 * Critical: Steps 2-4 must happen in useLayoutEffect BEFORE browser paints,
 * otherwise the user sees a flash of items at their final positions.
 */
export const useResizeFlip = ({ containerRef, itemSelector }: UseResizeFlipOptions) => {
  const preResizePositionsRef = useRef<Map<string, DOMRect>>(new Map());

  /**
   * FIRST: Capture viewport-relative positions of all visible items.
   * Call this BEFORE any state changes that will cause repositioning.
   */
  const capturePositions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    const positions = new Map<string, DOMRect>();

    items.forEach((item) => {
      const id = item.getAttribute('data-item-id');
      if (id) {
        // getBoundingClientRect gives viewport-relative position
        positions.set(id, item.getBoundingClientRect());
      }
    });

    preResizePositionsRef.current = positions;
  }, [containerRef, itemSelector]);

  /**
   * LAST + INVERT + PLAY: Calculate and apply transforms directly to DOM.
   *
   * CRITICAL: This must be called from useLayoutEffect (before paint).
   * We manipulate the DOM directly to avoid React re-render causing a flash.
   */
  const applyFlipTransforms = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (preResizePositionsRef.current.size === 0) return;

    const items = container.querySelectorAll(itemSelector);
    const elementsToAnimate: Array<{ element: HTMLElement; deltaX: number; deltaY: number }> = [];

    // LAST + INVERT: Calculate transforms for each item
    items.forEach((item) => {
      const id = item.getAttribute('data-item-id');
      if (!id) return;

      const oldRect = preResizePositionsRef.current.get(id);
      if (!oldRect) return; // New item, no animation needed

      const newRect = item.getBoundingClientRect();

      // Calculate offset to get back to old visual position
      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;

      // Only animate if there's meaningful movement (> 1px)
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        elementsToAnimate.push({ element: item as HTMLElement, deltaX, deltaY });
      }
    });

    if (elementsToAnimate.length === 0) {
      preResizePositionsRef.current.clear();
      return;
    }

    // INVERT: Apply inverse transforms immediately (still in useLayoutEffect, before paint)
    // This makes items APPEAR at their old positions when the browser finally paints
    elementsToAnimate.forEach(({ element, deltaX, deltaY }) => {
      // Disable transitions while we apply the inverse transform
      element.style.transition = 'none';
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    // Force a reflow to ensure the transforms are applied before we enable transitions
    // This is the key trick - we need the browser to "see" the inverted state
    void container.offsetHeight;

    // PLAY: Enable transitions and animate to final position (transform: none)
    elementsToAnimate.forEach(({ element }) => {
      element.style.transition = `transform var(--duration-normal) ease-out`;
      element.style.transform = '';
    });

    // Clean up after animation completes
    setTimeout(() => {
      elementsToAnimate.forEach(({ element }) => {
        element.style.transition = '';
        element.style.transform = '';
      });
      preResizePositionsRef.current.clear();
    }, YOUTUBE_VIEW_CONFIG.transitionDuration);
  }, [containerRef, itemSelector]);

  return {
    capturePositions,
    applyFlipTransforms,
  };
};
