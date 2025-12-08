import styles from './TrackEvent.module.css';
import type { EventWithPosition } from '../../constants';
import classNames from 'classnames';

interface TrackEventProps {
  event: EventWithPosition;
  trackY: number;
  cardHeight: number;
  connectorLength: number;
  onClick: (eventId: string) => void;
}

export const TrackEvent = ({
  event,
  trackY,
  cardHeight,
  connectorLength,
  onClick,
}: TrackEventProps) => {
  const { title, date_display, xPos, lane, stackIndex } = event;

  // Calculate vertical position based on lane and stack
  const stackOffset = stackIndex * (cardHeight + 12);
  const yOffset = lane === 'above'
    ? -(connectorLength + cardHeight + stackOffset)
    : connectorLength + stackOffset;

  return (
    <div
      className={classNames(styles.eventWrapper, styles[lane])}
      style={{
        left: `${xPos}px`,
        top: `${trackY + yOffset}px`,
      }}
      onClick={() => onClick(event.id)}
    >
      {/* Connector line to track */}
      <div
        className={styles.connector}
        style={{
          height: `${connectorLength + stackOffset}px`,
          top: lane === 'above' ? `${cardHeight}px` : undefined,
          bottom: lane === 'below' ? `${cardHeight}px` : undefined,
        }}
      />

      {/* Track anchor point */}
      <div
        className={styles.anchor}
        style={{
          top: lane === 'above' ? `${cardHeight + connectorLength + stackOffset}px` : undefined,
          bottom: lane === 'below' ? `${cardHeight + connectorLength + stackOffset}px` : undefined,
        }}
      />

      {/* Event card */}
      <div className={styles.card}>
        <div className={styles.content}>
          <span className={styles.date}>{date_display}</span>
          <span className={styles.title}>{title}</span>
        </div>
      </div>
    </div>
  );
};
