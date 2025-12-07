import classNames from 'classnames';
import type { TimelineEvent } from '../../../../types/timeline';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: TimelineEvent;
  onSelect: (id: string) => void;
  compact?: boolean;
}

/**
 * An individual event card within an exhibit bay.
 * Styled to resemble a museum placard or exhibit label.
 */
export const EventCard = ({ event, onSelect, compact = false }: EventCardProps) => {
  const hasImage = event.image_urls && event.image_urls.length > 0;

  return (
    <div
      className={classNames(styles.card, {
        [styles.compact]: compact,
        [styles.hasImage]: hasImage,
      })}
      onClick={() => onSelect(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(event.id);
        }
      }}
    >
      {hasImage && (
        <div className={styles.imageFrame}>
          <img
            src={event.image_urls[0]}
            alt={event.title}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.imageOverlay} />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.placard}>
          <span className={styles.type}>{event.type}</span>
          <span className={styles.date}>{event.date_display}</span>
        </div>

        <h4 className={styles.title}>{event.title}</h4>

        {!compact && (
          <p className={styles.description}>
            {event.description.slice(0, 100)}
            {event.description.length > 100 ? '...' : ''}
          </p>
        )}

        {event.innovator && (
          <div className={styles.innovator}>
            <span className={styles.innovatorLabel}>By</span>
            <span className={styles.innovatorName}>{event.innovator}</span>
          </div>
        )}
      </div>

      <div className={styles.viewIndicator}>
        <span>View Details</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
