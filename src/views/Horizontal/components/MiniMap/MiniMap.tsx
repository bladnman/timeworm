import { memo, useCallback, useRef, type MouseEvent } from 'react';
import type { TrackLayoutItem } from '../../hooks/useTrackLayout';
import styles from './MiniMap.module.css';

interface MiniMapProps {
  items: TrackLayoutItem[];
  totalWidth: number;
  viewportWidth: number;
  viewportOffset: number;
  minYear: number;
  maxYear: number;
  onViewportChange: (offset: number) => void;
}

/**
 * Mini overview map showing the entire timeline with viewport indicator.
 *
 * Follows the ethos of "Movement Is Meaning" - clicking and dragging
 * on the minimap feels like navigating through time itself.
 */
export const MiniMap = memo(function MiniMap({
  items,
  totalWidth,
  viewportWidth,
  viewportOffset,
  minYear,
  maxYear,
  onViewportChange,
}: MiniMapProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate viewport indicator position and size
  const viewportRatio = totalWidth > 0 ? viewportWidth / totalWidth : 1;
  const viewportIndicatorWidth = Math.max(10, viewportRatio * 100);
  const viewportIndicatorLeft = totalWidth > 0
    ? (viewportOffset / totalWidth) * (100 - viewportIndicatorWidth)
    : 0;

  // Handle click to navigate
  const handleTrackClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickRatio = clickX / rect.width;

      // Center viewport on click position
      const targetCenter = clickRatio * totalWidth;
      const newOffset = targetCenter - viewportWidth / 2;

      onViewportChange(Math.max(0, Math.min(totalWidth - viewportWidth, newOffset)));
    },
    [totalWidth, viewportWidth, onViewportChange]
  );

  // Handle viewport indicator drag
  const handleViewportDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const track = trackRef.current;
      if (!track) return;

      const startX = e.clientX;
      const startOffset = viewportOffset;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        const rect = track.getBoundingClientRect();
        const deltaX = moveEvent.clientX - startX;
        const deltaRatio = deltaX / rect.width;
        const newOffset = startOffset + deltaRatio * totalWidth;

        onViewportChange(
          Math.max(0, Math.min(totalWidth - viewportWidth, newOffset))
        );
      };

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [viewportOffset, totalWidth, viewportWidth, onViewportChange]
  );

  // Get normalized position for an item (0-1)
  const getNormalizedPosition = (xPos: number) => {
    return totalWidth > 0 ? xPos / totalWidth : 0;
  };

  return (
    <div className={styles.container}>
      {/* Year labels */}
      <div className={styles.yearLabels}>
        <span className={styles.yearLabel}>{minYear}</span>
        <span className={styles.yearLabel}>{maxYear}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className={styles.track}
        onClick={handleTrackClick}
      >
        {/* Event indicators */}
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.eventDot}
            style={{
              left: `${getNormalizedPosition(item.xPos) * 100}%`,
              opacity: item.type === 'cluster' ? 1 : 0.7,
            }}
            data-cluster={item.type === 'cluster'}
          />
        ))}

        {/* Axis line */}
        <div className={styles.axisLine} />

        {/* Viewport indicator */}
        <div
          className={styles.viewport}
          style={{
            left: `${viewportIndicatorLeft}%`,
            width: `${viewportIndicatorWidth}%`,
          }}
          onMouseDown={handleViewportDrag}
        />
      </div>

      {/* Instructions hint */}
      <div className={styles.hint}>
        Click or drag to navigate
      </div>
    </div>
  );
});
