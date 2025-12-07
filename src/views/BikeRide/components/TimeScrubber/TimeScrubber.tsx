import { memo, useCallback, useRef, MouseEvent } from 'react';
import { BIKE_RIDE_CONFIG } from '../../hooks/constants';
import styles from './TimeScrubber.module.css';

interface TimeScrubberProps {
  currentTime: number; // 0-1
  isPlaying: boolean;
  minYear: number;
  maxYear: number;
  currentYear: number;
  playbackSpeed: number;
  onTimeChange: (t: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onTogglePlayback: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 5, 10];

/**
 * Time scrubber control for navigating the bike ride timeline.
 *
 * Features:
 * - Draggable timeline slider
 * - Play/pause controls
 * - Speed adjustment
 * - Current year display
 */
export const TimeScrubber = memo(function TimeScrubber({
  currentTime,
  isPlaying,
  minYear,
  maxYear,
  currentYear,
  playbackSpeed,
  onTimeChange,
  onPlay,
  onPause,
  onTogglePlayback,
  onSpeedChange,
}: TimeScrubberProps) {
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

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  };

  return (
    <div className={styles.scrubber}>
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
        {/* Year labels */}
        <div className={styles.yearLabels}>
          <span className={styles.yearLabel}>{formatYear(minYear)}</span>
          <span className={styles.currentYear}>{formatYear(currentYear)}</span>
          <span className={styles.yearLabel}>{formatYear(maxYear)}</span>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className={styles.track}
          onClick={handleTrackClick}
        >
          {/* Progress fill */}
          <div
            className={styles.progress}
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
      <div className={styles.speedControl}>
        <span className={styles.speedLabel}>Speed</span>
        <select
          className={styles.speedSelect}
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        >
          {SPEED_OPTIONS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});
