import { memo, useState } from 'react';
import type { TimelineEvent } from '../../../../types/timeline';
import styles from './EventCard.module.css';
import classNames from 'classnames';

interface EventCardProps {
  event: TimelineEvent;
  isSelected?: boolean;
  compact?: boolean;
  isMilestone?: boolean;
  onClick: () => void;
}

/**
 * Event card with optional key art image display.
 *
 * Follows the ethos of "Integration Over Interruption" - cards feel like
 * natural extensions of the timeline, not interruptions to it.
 */
export const EventCard = memo(function EventCard({
  event,
  isSelected = false,
  compact = false,
  isMilestone = false,
  onClick,
}: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  // Milestones never show images
  const hasImage = !isMilestone && event.image_urls?.length > 0 && !imageError;
  const imageUrl = hasImage ? event.image_urls[0] : null;

  return (
    <div
      className={classNames(styles.card, {
        [styles.selected]: isSelected,
        [styles.compact]: compact,
        [styles.withImage]: hasImage,
        [styles.milestone]: isMilestone,
      })}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {hasImage && !compact && (
        <div className={styles.imageContainer}>
          <img
            src={imageUrl!}
            alt={event.title}
            className={styles.image}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.date}>{event.date_display}</div>
        <div className={styles.title}>{event.title}</div>
      </div>
    </div>
  );
});
