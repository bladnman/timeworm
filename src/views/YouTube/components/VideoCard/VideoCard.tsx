import { memo, useState } from 'react';
import type { TimelineEvent } from '../../../../types/timeline';
import styles from './VideoCard.module.css';
import classNames from 'classnames';

interface VideoCardProps {
  event: TimelineEvent;
  isSelected?: boolean;
  compact?: boolean;
  onClick: () => void;
}

/**
 * Video card with 16:9 thumbnail and play icon overlay.
 *
 * Styled with YouTube's red and charcoal color scheme.
 * Play icon appears on hover over the thumbnail.
 */
export const VideoCard = memo(function VideoCard({
  event,
  isSelected = false,
  compact = false,
  onClick,
}: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = event.image_urls?.length > 0 && !imageError;
  const imageUrl = hasImage ? event.image_urls[0] : null;

  return (
    <div
      className={classNames(styles.card, {
        [styles.selected]: isSelected,
        [styles.compact]: compact,
        [styles.withImage]: hasImage,
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
