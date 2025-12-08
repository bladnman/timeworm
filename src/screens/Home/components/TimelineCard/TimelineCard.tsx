/**
 * Timeline Card
 *
 * Individual timeline card for the Home screen.
 * Shows preview, title, overview, and metadata.
 * Animated with Framer Motion.
 */

import { motion } from 'framer-motion';
import type { TimelineManifestEntry } from '../../../../hooks/useTimelineLibrary';
import { useApp } from '../../../../hooks/useApp';
import { cardVariants } from '../../../../theme/motion';
import styles from './TimelineCard.module.css';

interface TimelineCardProps {
  timeline: TimelineManifestEntry;
}

/**
 * View mode display names for badge
 */
const viewModeNames: Record<string, string> = {
  vertical: 'List',
  horizontal: 'Track',
  comic: 'Comic',
  river: 'River',
  depthroad: 'Depth',
  mosaic: 'Mosaic',
  orbital: 'Orbital',
  strata: 'Strata',
  tree: 'Tree',
  bikeride: 'Bike Ride',
  train: 'Train',
  exhibit: 'Exhibit',
  trail: 'Trail',
  libraryShelf: 'Library',
};

export const TimelineCard: React.FC<TimelineCardProps> = ({ timeline }) => {
  const { navigateToTimeline } = useApp();

  const handleClick = () => {
    navigateToTimeline(timeline.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToTimeline(timeline.id);
    }
  };

  return (
    <motion.article
      className={styles.card}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${timeline.title} timeline`}
      layoutId={`timeline-${timeline.id}`}
    >
      {/* Preview area - placeholder for now, mini-viz will go here */}
      <div className={styles.preview}>
        <div className={styles.previewPlaceholder}>
          <svg
            className={styles.previewIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
            />
          </svg>
        </div>

      </div>

      {/* Content */}
      <div className={styles.content}>
        <h2 className={styles.title}>{timeline.title}</h2>
        <p className={styles.overview}>{timeline.overview}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <svg
              className={styles.metaIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {timeline.dateRange}
          </span>
          <span className={styles.metaItem}>
            <svg
              className={styles.metaIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            {timeline.eventCount} events
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className={styles.hoverOverlay} />

      {/* View badge (shown on hover via CSS) */}
      <span className={styles.viewBadge}>{viewModeNames[timeline.defaultView] || 'View'}</span>
    </motion.article>
  );
};
