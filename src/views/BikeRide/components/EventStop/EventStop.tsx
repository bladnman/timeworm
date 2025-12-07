import { memo, useCallback } from 'react';
import { BikeRideEvent } from '../../hooks/useBikeRideView';
import { BIKE_RIDE_CONFIG } from '../../hooks/constants';
import styles from './EventStop.module.css';

interface EventStopProps {
  event: BikeRideEvent;
  isSelected: boolean;
  isHovered: boolean;
  isPast: boolean; // Whether the bike has passed this stop
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

/**
 * Renders an event marker along the bike path.
 *
 * Events appear as "stops" with:
 * - A marker circle on the path
 * - A connector line to a label card
 * - The event title and date
 * - Visual indication of whether it's been "visited" (past current time)
 */
export const EventStop = memo(function EventStop({
  event,
  isSelected,
  isHovered,
  isPast,
  onSelect,
  onHover,
}: EventStopProps) {
  const { x, y, showGapIndicator, gapYearsBefore } = event;

  // Alternate label position above/below path based on index parity
  // This prevents overlapping labels
  const labelAbove = Math.floor(event.t * 100) % 2 === 0;
  const labelOffset = labelAbove
    ? -BIKE_RIDE_CONFIG.stopLabelOffset
    : BIKE_RIDE_CONFIG.stopLabelOffset;

  const handleClick = useCallback(() => {
    onSelect(event.event.id);
  }, [onSelect, event.event.id]);

  const handleMouseEnter = useCallback(() => {
    onHover(event.event.id);
  }, [onHover, event.event.id]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const radius = isHovered || isSelected
    ? BIKE_RIDE_CONFIG.stopHoverRadius
    : BIKE_RIDE_CONFIG.stopRadius;

  return (
    <g
      className={`${styles.eventStop} ${isPast ? styles.past : ''} ${isSelected ? styles.selected : ''} ${isHovered ? styles.hovered : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gap indicator */}
      {showGapIndicator && gapYearsBefore && (
        <g className={styles.gapIndicator}>
          <text
            x={x - 40}
            y={y - 40}
            className={styles.gapText}
          >
            {formatGap(gapYearsBefore)}
          </text>
          <path
            d={`M ${x - 60} ${y - 20} Q ${x - 30} ${y - 30} ${x - 10} ${y - 10}`}
            className={styles.gapConnector}
          />
        </g>
      )}

      {/* Marker glow for selected/hovered */}
      {(isSelected || isHovered) && (
        <circle
          cx={x}
          cy={y}
          r={radius + 8}
          className={styles.markerGlow}
        />
      )}

      {/* Main marker circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        className={styles.marker}
      />

      {/* Inner dot */}
      <circle
        cx={x}
        cy={y}
        r={radius * 0.4}
        className={styles.markerInner}
      />

      {/* Connector line to label */}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y + labelOffset * 0.7}
        className={styles.connector}
      />

      {/* Label card */}
      <foreignObject
        x={x - BIKE_RIDE_CONFIG.stopLabelMaxWidth / 2}
        y={labelAbove ? y - BIKE_RIDE_CONFIG.stopLabelOffset - 60 : y + BIKE_RIDE_CONFIG.stopLabelOffset}
        width={BIKE_RIDE_CONFIG.stopLabelMaxWidth}
        height={60}
        className={styles.labelContainer}
      >
        <div className={styles.label}>
          <span className={styles.labelDate}>{event.event.date_display}</span>
          <span className={styles.labelTitle}>{event.event.title}</span>
        </div>
      </foreignObject>

      {/* Signpost decoration */}
      <rect
        x={x - 2}
        y={y + (labelAbove ? 0 : -20)}
        width={4}
        height={20}
        className={styles.signpost}
        rx={2}
      />
    </g>
  );
});

/**
 * Format a year gap into human-readable form
 */
function formatGap(years: number): string {
  if (years >= 1000) {
    const millennia = Math.floor(years / 1000);
    return `${millennia.toLocaleString()}k+ yrs`;
  }
  if (years >= 100) {
    const centuries = Math.floor(years / 100);
    return `${centuries} ${centuries === 1 ? 'century' : 'centuries'}`;
  }
  return `${years} years`;
}
