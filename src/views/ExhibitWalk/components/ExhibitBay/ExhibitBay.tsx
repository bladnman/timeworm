import classNames from 'classnames';
import type { ExhibitBay as ExhibitBayType } from '../../hooks/useExhibitWalk';
import { EventCard } from '../EventCard/EventCard';
import styles from './ExhibitBay.module.css';

interface ExhibitBayProps {
  bay: ExhibitBayType;
  isExpanded: boolean;
  isHovered: boolean;
  onExpand: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onSelectEvent: (id: string) => void;
}

/**
 * An exhibit bay - a framed display case containing events from a time segment.
 * Resembles a museum alcove or gallery bay.
 */
export const ExhibitBay = ({
  bay,
  isExpanded,
  isHovered,
  onExpand,
  onHover,
  onSelectEvent,
}: ExhibitBayProps) => {
  const eventCount = bay.events.length;
  const showCompactCards = eventCount > 4 && !isExpanded;

  return (
    <div
      className={classNames(styles.bay, styles[bay.size], {
        [styles.expanded]: isExpanded,
        [styles.hovered]: isHovered,
      })}
      style={{
        left: `${bay.xPosition}px`,
        width: `${bay.width}px`,
      }}
      onMouseEnter={() => onHover(bay.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Frame top border - decorative */}
      <div className={styles.frameTop} />

      {/* Bay header with time label */}
      <div className={styles.header} onClick={() => onExpand(bay.id)}>
        <div className={styles.timeLabel}>{bay.label}</div>
        {eventCount > 1 && (
          <div className={styles.eventCount}>
            {eventCount} {eventCount === 1 ? 'exhibit' : 'exhibits'}
          </div>
        )}
        {bay.yearSpan > 0 && (
          <div className={styles.duration}>
            {bay.yearSpan < 1
              ? '< 1 year'
              : `${Math.round(bay.yearSpan)} ${bay.yearSpan === 1 ? 'year' : 'years'}`}
          </div>
        )}
      </div>

      {/* Display case - contains event cards */}
      <div
        className={classNames(styles.displayCase, {
          [styles.multiColumn]: eventCount > 2 && !showCompactCards,
        })}
      >
        {bay.events.map((event, index) => (
          <div
            key={event.id}
            className={styles.cardWrapper}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <EventCard
              event={event}
              onSelect={onSelectEvent}
              compact={showCompactCards}
            />
          </div>
        ))}
      </div>

      {/* Expand/collapse indicator for bays with many events */}
      {eventCount > 4 && (
        <button
          className={styles.expandToggle}
          onClick={() => onExpand(isExpanded ? null : bay.id)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse exhibit bay' : 'Expand exhibit bay'}
        >
          <span>{isExpanded ? 'Show less' : `View all ${eventCount}`}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={classNames(styles.expandIcon, {
              [styles.rotated]: isExpanded,
            })}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}

      {/* Gap indicator (visual) */}
      {bay.gapFromPrevious !== null && bay.gapFromPrevious > 5 && (
        <div className={styles.gapMarker}>
          <div className={styles.gapLine} />
          <span className={styles.gapText}>
            {formatGapLabel(bay.gapFromPrevious)}
          </span>
        </div>
      )}

      {/* Frame bottom border - decorative */}
      <div className={styles.frameBottom} />
    </div>
  );
};

/**
 * Format the gap label for display.
 */
const formatGapLabel = (years: number): string => {
  if (years < 1) return '';
  if (years < 10) return `${Math.round(years)} yrs`;
  if (years < 100) return `${Math.round(years)} years`;
  if (years < 1000) {
    const centuries = Math.round(years / 100);
    return centuries === 1 ? '~1 century' : `~${centuries} centuries`;
  }
  return `~${Math.round(years).toLocaleString()} years`;
};
