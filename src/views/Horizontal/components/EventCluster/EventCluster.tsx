import { memo, useState, useCallback, useRef, useEffect } from 'react';
import type { TimelineEvent } from '../../../../types/timeline';
import styles from './EventCluster.module.css';
import classNames from 'classnames';

interface EventClusterProps {
  events: TimelineEvent[];
  startYear: number;
  endYear: number;
  lane: 'above' | 'below';
  onEventClick: (eventId: string) => void;
  onExpand?: () => void;
}

/**
 * Cluster badge for dense event areas (4+ overlapping events).
 *
 * Follows the ethos principle "Subtle Confidence" - the cluster presents itself
 * with quiet assurance, revealing its contents through deliberate interaction.
 */
export const EventCluster = memo(function EventCluster({
  events,
  startYear,
  endYear,
  lane,
  onEventClick,
  onExpand,
}: EventClusterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`;
    return year.toString();
  };

  const dateRange = startYear === endYear
    ? formatYear(startYear)
    : `${formatYear(startYear)} - ${formatYear(endYear)}`;

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next && onExpand) {
        onExpand();
      }
      return next;
    });
  }, [onExpand]);

  const handleEventSelect = useCallback((eventId: string) => {
    onEventClick(eventId);
    setIsExpanded(false);
  }, [onEventClick]);

  // Close on click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Close on escape
  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.cluster, styles[lane], {
        [styles.expanded]: isExpanded,
      })}
    >
      {/* Collapsed badge */}
      <button
        className={styles.badge}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={`${events.length} events from ${dateRange}`}
      >
        <span className={styles.count}>{events.length}</span>
        <span className={styles.label}>events</span>
        <span className={styles.dateRange}>{dateRange}</span>
        <span className={styles.chevron}>{isExpanded ? '−' : '+'}</span>
      </button>

      {/* Expanded event list */}
      {isExpanded && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>{events.length} Events</span>
            <span className={styles.dropdownRange}>{dateRange}</span>
          </div>
          <div className={styles.eventList}>
            {events.map((event) => (
              <button
                key={event.id}
                className={styles.eventItem}
                onClick={() => handleEventSelect(event.id)}
              >
                {event.image_urls?.[0] && (
                  <img
                    src={event.image_urls[0]}
                    alt=""
                    className={styles.eventThumb}
                    loading="lazy"
                  />
                )}
                <div className={styles.eventInfo}>
                  <span className={styles.eventDate}>{event.date_display}</span>
                  <span className={styles.eventTitle}>{event.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
