import { useState } from 'react';
import styles from './EventCluster.module.css';
import type { EventCluster as EventClusterType } from '../../constants';
import classNames from 'classnames';

interface EventClusterProps {
  cluster: EventClusterType;
  trackY: number;
  connectorLength: number;
  onEventClick: (eventId: string) => void;
}

export const EventCluster = ({
  cluster,
  trackY,
  connectorLength,
  onEventClick,
}: EventClusterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { events, xPos, startYear, endYear, lane } = cluster;

  const yOffset = lane === 'above'
    ? -(connectorLength + 80)
    : connectorLength;

  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`;
    return year.toString();
  };

  const dateRange = startYear === endYear
    ? formatYear(startYear)
    : `${formatYear(startYear)} - ${formatYear(endYear)}`;

  return (
    <div
      className={classNames(styles.clusterWrapper, styles[lane], { [styles.expanded]: isExpanded })}
      style={{
        left: `${xPos}px`,
        top: `${trackY + yOffset}px`,
      }}
    >
      {/* Connector */}
      <div
        className={styles.connector}
        style={{
          height: `${connectorLength}px`,
          top: lane === 'above' ? '80px' : undefined,
          bottom: lane === 'below' ? '80px' : undefined,
        }}
      />

      {/* Anchor */}
      <div
        className={styles.anchor}
        style={{
          top: lane === 'above' ? `${80 + connectorLength}px` : undefined,
          bottom: lane === 'below' ? `${80 + connectorLength}px` : undefined,
        }}
      />

      {/* Collapsed view */}
      {!isExpanded && (
        <div
          className={styles.clusterCard}
          onClick={() => setIsExpanded(true)}
        >
          <div className={styles.count}>{events.length}</div>
          <div className={styles.info}>
            <span className={styles.label}>events</span>
            <span className={styles.dateRange}>{dateRange}</span>
          </div>
          <div className={styles.expandIcon}>+</div>
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className={styles.expandedContainer}>
          <button
            className={styles.collapseButton}
            onClick={() => setIsExpanded(false)}
          >
            Collapse ({events.length} events)
          </button>
          <div className={styles.eventList}>
            {events.map((event) => (
              <div
                key={event.id}
                className={styles.eventItem}
                onClick={() => onEventClick(event.id)}
              >
                <span className={styles.eventDate}>{event.date_display}</span>
                <span className={styles.eventTitle}>{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
