import { memo, useCallback, useRef, type MouseEvent } from 'react';
import type { BikeRideEvent } from '../../hooks/useBikeRideView';
import { BIKE_RIDE_CONFIG } from '../../hooks/constants';
import styles from './MiniMap.module.css';

interface MiniMapProps {
  events: BikeRideEvent[];
  totalWidth: number;
  viewportWidth: number;
  viewportOffset: number;
  currentTime: number;
  onViewportChange: (offset: number) => void;
  onTimeChange: (t: number) => void;
}

/**
 * Mini overview map showing the entire timeline.
 *
 * Features:
 * - Condensed view of all events as dots
 * - Viewport indicator showing current visible region
 * - Click to navigate to different parts of the timeline
 * - Current time marker
 */
export const MiniMap = memo(function MiniMap({
  events,
  totalWidth,
  viewportWidth,
  viewportOffset,
  currentTime,
  onViewportChange,
  onTimeChange,
}: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate viewport indicator dimensions
  const viewportRatio = totalWidth > 0 ? viewportWidth / totalWidth : 1;
  const viewportIndicatorWidth = Math.max(
    BIKE_RIDE_CONFIG.viewportIndicatorMinWidth,
    viewportRatio * 100
  );
  const viewportIndicatorLeft = totalWidth > 0
    ? (viewportOffset / totalWidth) * (100 - viewportIndicatorWidth)
    : 0;

  // Handle click to navigate
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = x / rect.width;

      // Set current time to clicked position
      onTimeChange(Math.max(0, Math.min(1, t)));

      // Also update viewport to center on this position
      const newOffset = t * totalWidth - viewportWidth / 2;
      onViewportChange(Math.max(0, Math.min(totalWidth - viewportWidth, newOffset)));
    },
    [totalWidth, viewportWidth, onTimeChange, onViewportChange]
  );

  // Handle viewport drag
  const handleViewportDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const startX = e.clientX;
      const startOffset = viewportOffset;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        const rect = container.getBoundingClientRect();
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
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [viewportOffset, totalWidth, viewportWidth, onViewportChange]
  );

  return (
    <div className={styles.miniMap}>
      <div
        ref={containerRef}
        className={styles.track}
        onClick={handleClick}
      >
        {/* Event dots */}
        {events.map((event) => (
          <div
            key={event.event.id}
            className={styles.eventDot}
            style={{ left: `${event.t * 100}%` }}
            title={event.event.title}
          />
        ))}

        {/* Current time marker */}
        <div
          className={styles.timeMarker}
          style={{ left: `${currentTime * 100}%` }}
        />

        {/* Viewport indicator */}
        <div
          className={styles.viewport}
          style={{
            left: `${viewportIndicatorLeft}%`,
            width: `${viewportIndicatorWidth}%`,
          }}
          onMouseDown={handleViewportDrag}
        >
          <div className={styles.viewportHandle} />
        </div>
      </div>

      {/* Path preview line */}
      <svg className={styles.pathPreview} viewBox="0 0 100 20" preserveAspectRatio="none">
        <path
          d="M 0 10 Q 25 5 50 10 Q 75 15 100 10"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        {/* Progress on path */}
        <path
          d="M 0 10 Q 25 5 50 10 Q 75 15 100 10"
          fill="none"
          stroke="var(--color-text-accent)"
          strokeWidth="2"
          strokeDasharray="100"
          strokeDashoffset={100 - currentTime * 100}
          opacity="0.5"
        />
      </svg>
    </div>
  );
});
