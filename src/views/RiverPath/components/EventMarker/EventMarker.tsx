/**
 * EventMarker component - displays an event on the river bank.
 *
 * Markers are positioned on alternating sides of the river,
 * connected by a subtle line to their position on the centerline.
 */

import type { RiverEvent } from '../../hooks/useRiverPath';
import styles from './EventMarker.module.css';

interface EventMarkerProps {
  event: RiverEvent;
  isHovered: boolean;
  isSelected: boolean;
  zoom: number;
  showLabel: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export const EventMarker = ({
  event,
  isHovered,
  isSelected,
  zoom: _zoom, // Reserved for future LOD use
  showLabel,
  onHover,
  onClick,
}: EventMarkerProps) => {
  void _zoom; // Suppress unused variable lint error
  const markerSize = isHovered || isSelected ? 16 : 12;

  // Calculate connector line from river center to marker
  const connectorPath = `M ${event.riverPosition.x} ${event.riverPosition.y} L ${event.position.x} ${event.position.y}`;

  return (
    <g
      className={styles.markerGroup}
      data-hovered={isHovered}
      data-selected={isSelected}
      data-side={event.side}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(event.id)}
    >
      {/* Connector line from river to marker */}
      <path
        d={connectorPath}
        className={styles.connector}
        strokeDasharray={isHovered || isSelected ? 'none' : '4 4'}
      />

      {/* Anchor point on river */}
      <circle
        cx={event.riverPosition.x}
        cy={event.riverPosition.y}
        r={4}
        className={styles.anchor}
      />

      {/* Main marker */}
      <circle
        cx={event.position.x}
        cy={event.position.y}
        r={markerSize}
        className={styles.marker}
      />

      {/* Inner glow */}
      <circle
        cx={event.position.x}
        cy={event.position.y}
        r={markerSize * 0.6}
        className={styles.markerInner}
      />

      {/* Label (shown when zoomed in or hovered) */}
      {(showLabel || isHovered || isSelected) && (
        <g className={styles.labelGroup}>
          {/* Label background */}
          <rect
            x={event.side === 'left' ? event.position.x - 160 : event.position.x + 20}
            y={event.position.y - 25}
            width={140}
            height={50}
            rx={6}
            className={styles.labelBg}
          />

          {/* Date */}
          <text
            x={event.side === 'left' ? event.position.x - 90 : event.position.x + 90}
            y={event.position.y - 8}
            className={styles.labelDate}
            textAnchor="middle"
          >
            {event.date_display}
          </text>

          {/* Title */}
          <text
            x={event.side === 'left' ? event.position.x - 90 : event.position.x + 90}
            y={event.position.y + 12}
            className={styles.labelTitle}
            textAnchor="middle"
          >
            {event.title.length > 18 ? event.title.slice(0, 16) + '...' : event.title}
          </text>
        </g>
      )}
    </g>
  );
};
