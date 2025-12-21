import { memo, useCallback, useEffect, useState } from 'react';
import type { TimelineEvent } from '../../../../types/timeline';
import styles from './EventSpotlight.module.css';
import classNames from 'classnames';

interface EventSpotlightProps {
  events: TimelineEvent[]; // Can be single event or multiple (from cluster)
  initialIndex?: number;
  onClose: () => void;
  onNavigateToEvent?: (eventId: string) => void;
}

/**
 * Centered spotlight modal for detailed event exploration.
 *
 * Follows the ethos principle "Blending, Not Switching" - the spotlight
 * feels like zooming into an event rather than switching to a different view.
 * It "arrives" rather than "pops".
 */
export const EventSpotlight = memo(function EventSpotlight({
  events,
  initialIndex = 0,
  onClose,
  onNavigateToEvent,
}: EventSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageError, setImageError] = useState(false);

  const event = events[currentIndex];
  const hasMultiple = events.length > 1;
  const isMilestone = event?.metrics?.milestone === true;
  const hasImage = !isMilestone && event?.image_urls?.length > 0 && !imageError;

  // Reset image error when changing events
  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : events.length - 1));
  }, [events.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i < events.length - 1 ? i + 1 : 0));
  }, [events.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasMultiple) handlePrev();
          break;
        case 'ArrowRight':
          if (hasMultiple) handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, hasMultiple, handlePrev, handleNext]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!event) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.spotlight}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotlight-title"
      >
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden>×</span>
        </button>

        {/* Navigation arrows for multiple events */}
        {hasMultiple && (
          <>
            <button
              className={classNames(styles.navButton, styles.navPrev)}
              onClick={handlePrev}
              aria-label="Previous event"
            >
              ‹
            </button>
            <button
              className={classNames(styles.navButton, styles.navNext)}
              onClick={handleNext}
              aria-label="Next event"
            >
              ›
            </button>
          </>
        )}

        {/* Main content */}
        <div className={classNames(styles.content, { [styles.milestoneContent]: isMilestone })}>
          {/* Milestone banner */}
          {isMilestone && (
            <div className={styles.milestoneBanner}>
              <span className={styles.milestoneIcon}>◆</span>
              <span className={styles.milestoneLabel}>Milestone</span>
            </div>
          )}

          {/* Image */}
          {hasImage && (
            <div className={styles.imageContainer}>
              <img
                src={event.image_urls[0]}
                alt={event.title}
                className={styles.image}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Details */}
          <div className={styles.details}>
            <div className={styles.date}>{event.date_display}</div>
            <h2 id="spotlight-title" className={styles.title}>
              {event.title}
            </h2>

            {event.description && (
              <p className={styles.description}>{event.description}</p>
            )}

            {/* Metrics */}
            {event.metrics && Object.keys(event.metrics).length > 0 && (
              <div className={styles.metrics}>
                {Object.entries(event.metrics)
                  .filter(([key]) => key !== 'milestone') // Don't display milestone flag
                  .map(([key, value]) => (
                    <div key={key} className={styles.metricRow}>
                      <span className={styles.metricLabel}>{key}</span>
                      <span className={styles.metricValue}>{String(value)}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Links */}
            {event.links && event.links.length > 0 && (
              <div className={styles.links}>
                {event.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {link.title}
                    <span className={styles.linkIcon}>↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination indicator for multiple events */}
        {hasMultiple && (
          <div className={styles.pagination}>
            <span className={styles.paginationCurrent}>{currentIndex + 1}</span>
            <span className={styles.paginationSep}>/</span>
            <span className={styles.paginationTotal}>{events.length}</span>
            <span className={styles.paginationHint}>Use ← → to navigate</span>
          </div>
        )}

        {/* Navigate to event button */}
        {onNavigateToEvent && (
          <button
            className={styles.navigateButton}
            onClick={() => onNavigateToEvent(event.id)}
          >
            Navigate to this event
          </button>
        )}
      </div>
    </div>
  );
});
