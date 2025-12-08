import { memo, useCallback } from 'react';
import type { ComponentTheme } from '../../types/componentTheme';
import { DEFAULT_COMPONENT_THEME, themeToCSS } from '../../types/componentTheme';
import styles from './ZoomControls.module.css';

export interface ZoomControlsProps {
  /** Current zoom level */
  zoomLevel: number;
  /** Minimum zoom level */
  minZoom: number;
  /** Maximum zoom level */
  maxZoom: number;
  /** Callback when zoom changes */
  onZoomChange: (zoom: number) => void;
  /** Zoom step multiplier (default: 1.2 for 20% increments) */
  zoomStep?: number;
  /** Unit label for the zoom display (e.g., "px/yr") */
  unit?: string;
  /** Optional theme customization */
  theme?: ComponentTheme;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether to show the reset button */
  showReset?: boolean;
  /** Default zoom level for reset */
  defaultZoom?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * ZoomControls - Shared zoom control buttons.
 *
 * Features:
 * - Plus/minus buttons for incremental zoom
 * - Optional reset button
 * - Current zoom level display
 * - Glass UI styling with theme customization
 * - Horizontal or vertical layout
 */
export const ZoomControls = memo(function ZoomControls({
  zoomLevel,
  minZoom,
  maxZoom,
  onZoomChange,
  zoomStep = 1.2,
  unit = '',
  theme = DEFAULT_COMPONENT_THEME,
  orientation = 'vertical',
  showReset = true,
  defaultZoom,
  className,
}: ZoomControlsProps) {
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(maxZoom, zoomLevel * zoomStep);
    onZoomChange(newZoom);
  }, [zoomLevel, maxZoom, zoomStep, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(minZoom, zoomLevel / zoomStep);
    onZoomChange(newZoom);
  }, [zoomLevel, minZoom, zoomStep, onZoomChange]);

  const handleReset = useCallback(() => {
    if (defaultZoom !== undefined) {
      onZoomChange(defaultZoom);
    }
  }, [defaultZoom, onZoomChange]);

  const isAtMin = zoomLevel <= minZoom;
  const isAtMax = zoomLevel >= maxZoom;

  const sizeClass =
    theme.size === 'compact'
      ? styles.compact
      : theme.size === 'large'
        ? styles.large
        : '';

  const orientationClass =
    orientation === 'horizontal' ? styles.horizontal : styles.vertical;

  // Format zoom level for display
  const formatZoom = (value: number) => {
    if (value >= 100) return Math.round(value);
    if (value >= 10) return Math.round(value);
    return value.toFixed(1);
  };

  return (
    <div
      className={`${styles.controls} ${sizeClass} ${orientationClass} ${className ?? ''}`}
      style={themeToCSS(theme)}
    >
      {/* Zoom in */}
      <button
        className={styles.button}
        onClick={handleZoomIn}
        disabled={isAtMax}
        aria-label="Zoom in"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Reset */}
      {showReset && defaultZoom !== undefined && (
        <button
          className={`${styles.button} ${styles.resetButton}`}
          onClick={handleReset}
          aria-label="Reset zoom"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}

      {/* Zoom out */}
      <button
        className={styles.button}
        onClick={handleZoomOut}
        disabled={isAtMin}
        aria-label="Zoom out"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Zoom level display */}
      {theme.showLabels && (
        <div className={styles.zoomDisplay}>
          <span className={styles.zoomValue}>{formatZoom(zoomLevel)}</span>
          {unit && <span className={styles.zoomUnit}>{unit}</span>}
        </div>
      )}
    </div>
  );
});
