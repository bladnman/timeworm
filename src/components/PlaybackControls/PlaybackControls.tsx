import { memo, useCallback, useRef, type MouseEvent } from 'react';
import type { ComponentTheme } from '../../types/componentTheme';
import { DEFAULT_COMPONENT_THEME, themeToCSS } from '../../types/componentTheme';
import styles from './PlaybackControls.module.css';

export interface PlaybackControlsProps {
  /** Current position as normalized value (0-1) */
  currentTime: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Current playback speed multiplier */
  playbackSpeed: number;
  /** Callback when time/position changes */
  onTimeChange: (t: number) => void;
  /** Callback to toggle play/pause */
  onTogglePlayback: () => void;
  /** Callback when speed changes */
  onSpeedChange: (speed: number) => void;
  /** Display label for start position */
  startLabel?: string;
  /** Display label for end position */
  endLabel?: string;
  /** Display label for current position (centered) */
  currentLabel?: string;
  /** Available speed options (default: [0.5, 1, 2, 5, 10]) */
  speedOptions?: number[];
  /** Optional theme customization */
  theme?: ComponentTheme;
  /** Whether to show speed controls */
  showSpeedControl?: boolean;
  /** Whether to show the progress gradient */
  showProgressGradient?: boolean;
  /** Additional CSS class */
  className?: string;
}

const DEFAULT_SPEED_OPTIONS = [0.5, 1, 2, 5, 10];

/**
 * PlaybackControls - A shared timeline scrubber with play/pause and speed controls.
 *
 * Features:
 * - Play/pause button with icon
 * - Draggable timeline slider
 * - Click track to jump to position
 * - Speed adjustment dropdown
 * - Glass UI styling with theme customization
 */
export const PlaybackControls = memo(function PlaybackControls({
  currentTime,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  onTogglePlayback,
  onSpeedChange,
  startLabel,
  endLabel,
  currentLabel,
  speedOptions = DEFAULT_SPEED_OPTIONS,
  theme = DEFAULT_COMPONENT_THEME,
  showSpeedControl = true,
  showProgressGradient = true,
  className,
}: PlaybackControlsProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = Math.max(0, Math.min(1, x / rect.width));
      onTimeChange(t);
    },
    [onTimeChange]
  );

  const handleThumbDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        const rect = track.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const t = Math.max(0, Math.min(1, x / rect.width));
        onTimeChange(t);
      };

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [onTimeChange]
  );

  const sizeClass =
    theme.size === 'compact'
      ? styles.compact
      : theme.size === 'large'
        ? styles.large
        : '';

  return (
    <div
      className={`${styles.controls} ${sizeClass} ${className ?? ''}`}
      style={themeToCSS(theme)}
    >
      {/* Play/Pause button */}
      <button
        className={styles.playButton}
        onClick={onTogglePlayback}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="3" width="4" height="14" rx="1" />
            <rect x="12" y="3" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3.5L16 10L5 16.5V3.5Z" />
          </svg>
        )}
      </button>

      {/* Time track */}
      <div className={styles.trackContainer}>
        {/* Labels */}
        {theme.showLabels && (startLabel || currentLabel || endLabel) && (
          <div className={styles.labels}>
            <span className={styles.label}>{startLabel}</span>
            <span className={styles.currentLabel}>{currentLabel}</span>
            <span className={styles.label}>{endLabel}</span>
          </div>
        )}

        {/* Track */}
        <div ref={trackRef} className={styles.track} onClick={handleTrackClick}>
          {/* Progress fill */}
          <div
            className={`${styles.progress} ${showProgressGradient ? styles.gradient : ''}`}
            style={{ width: `${currentTime * 100}%` }}
          />

          {/* Thumb */}
          <div
            className={styles.thumb}
            style={{ left: `${currentTime * 100}%` }}
            onMouseDown={handleThumbDrag}
          >
            <div className={styles.thumbInner} />
          </div>
        </div>
      </div>

      {/* Speed control */}
      {showSpeedControl && (
        <div className={styles.speedControl}>
          <span className={styles.speedLabel}>Speed</span>
          <select
            className={styles.speedSelect}
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
          >
            {speedOptions.map((speed) => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
});
