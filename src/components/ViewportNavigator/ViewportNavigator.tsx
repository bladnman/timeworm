import { memo, useCallback, useRef, type MouseEvent } from 'react';
import type { ComponentTheme } from '../../types/componentTheme';
import { DEFAULT_COMPONENT_THEME, themeToCSS } from '../../types/componentTheme';
import styles from './ViewportNavigator.module.css';

/**
 * Generic marker for displaying events/points on the navigator.
 */
export interface NavigatorMarker {
  /** Unique identifier */
  id: string;
  /** Position as normalized value (0-1) */
  position: number;
  /** Optional tooltip text */
  title?: string;
  /** Optional custom color override */
  color?: string;
}

export interface ViewportNavigatorProps {
  /** Array of markers to display on the track */
  markers: NavigatorMarker[];
  /** Total content width in pixels */
  totalWidth: number;
  /** Visible viewport width in pixels */
  viewportWidth: number;
  /** Current viewport scroll offset in pixels */
  viewportOffset: number;
  /** Optional current time/position as normalized value (0-1) */
  currentTime?: number;
  /** Callback when viewport is dragged/clicked */
  onViewportChange: (offset: number) => void;
  /** Optional callback when clicking to set current time */
  onTimeChange?: (t: number) => void;
  /** Optional theme customization */
  theme?: ComponentTheme;
  /** Minimum width for viewport indicator (px), default 40 */
  minViewportWidth?: number;
  /** Whether to show the path preview line */
  showPathPreview?: boolean;
  /** Custom path SVG for preview (viewBox should be "0 0 100 20") */
  pathPreview?: React.ReactNode;
  /** Label to show on the left */
  startLabel?: string;
  /** Label to show on the right */
  endLabel?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * ViewportNavigator - A shared minimap component for viewport navigation.
 *
 * Features:
 * - Displays markers (events) as dots on a track
 * - Shows viewport indicator that can be dragged
 * - Click anywhere to navigate
 * - Optional current time marker with glow
 * - Glass UI styling with theme customization
 * - Optional path preview visualization
 */
export const ViewportNavigator = memo(function ViewportNavigator({
  markers,
  totalWidth,
  viewportWidth,
  viewportOffset,
  currentTime,
  onViewportChange,
  onTimeChange,
  theme = DEFAULT_COMPONENT_THEME,
  minViewportWidth = 40,
  showPathPreview = false,
  pathPreview,
  startLabel,
  endLabel,
  className,
}: ViewportNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate viewport indicator dimensions
  const viewportRatio = totalWidth > 0 ? viewportWidth / totalWidth : 1;
  const viewportIndicatorWidth = Math.max(
    minViewportWidth / (containerRef.current?.offsetWidth ?? 100) * 100,
    viewportRatio * 100
  );
  const viewportIndicatorLeft =
    totalWidth > 0
      ? (viewportOffset / totalWidth) * (100 - viewportIndicatorWidth)
      : 0;

  // Handle click to navigate
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = x / rect.width;
      const clampedT = Math.max(0, Math.min(1, t));

      // Set current time if callback provided
      onTimeChange?.(clampedT);

      // Update viewport to center on this position
      const newOffset = clampedT * totalWidth - viewportWidth / 2;
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

  const sizeClass = theme.size === 'compact' ? styles.compact : theme.size === 'large' ? styles.large : '';

  return (
    <div
      className={`${styles.navigator} ${sizeClass} ${className ?? ''}`}
      style={themeToCSS(theme)}
    >
      {/* Labels */}
      {theme.showLabels && (startLabel || endLabel) && (
        <div className={styles.labels}>
          {startLabel && <span className={styles.label}>{startLabel}</span>}
          {endLabel && <span className={styles.label}>{endLabel}</span>}
        </div>
      )}

      <div
        ref={containerRef}
        className={styles.track}
        onClick={handleClick}
      >
        {/* Marker dots */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className={styles.marker}
            style={{
              left: `${marker.position * 100}%`,
              backgroundColor: marker.color,
            }}
            title={marker.title}
          />
        ))}

        {/* Current time marker */}
        {currentTime !== undefined && (
          <div
            className={styles.timeMarker}
            style={{ left: `${currentTime * 100}%` }}
          />
        )}

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

      {/* Path preview */}
      {showPathPreview && (
        <svg
          className={styles.pathPreview}
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
        >
          {pathPreview ?? (
            <>
              <path
                d="M 0 10 Q 25 5 50 10 Q 75 15 100 10"
                fill="none"
                className={styles.pathLine}
                strokeWidth="2"
              />
              {currentTime !== undefined && (
                <path
                  d="M 0 10 Q 25 5 50 10 Q 75 15 100 10"
                  fill="none"
                  className={styles.pathProgress}
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset={100 - currentTime * 100}
                />
              )}
            </>
          )}
        </svg>
      )}
    </div>
  );
});
