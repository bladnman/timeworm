import type { Book } from '../../hooks/useLibraryShelfView';
import styles from './BookSpine.module.css';

interface BookSpineProps {
  book: Book;
  isOpen: boolean;
  zoom: number;
  onClick: () => void;
}

/**
 * BookSpine renders a single book on the shelf.
 * Visual elements include:
 * - Colored spine with title
 * - Event count indicator
 * - Density markers (dots/lines for event distribution)
 * - Hover state for quick summary
 */
export const BookSpine = ({ book, isOpen, zoom, onClick }: BookSpineProps) => {
  const { spineWidth, spineColor, label, chapters, density } = book;
  const scaledWidth = spineWidth * zoom;

  // Calculate dot positions to show event distribution within the book
  const eventMarkers = chapters.slice(0, 8).map((chapter, index) => ({
    key: chapter.event.id,
    position: chapter.relativePosition,
    isFirst: index === 0,
    isLast: index === chapters.length - 1,
  }));

  const hasMoreEvents = chapters.length > 8;

  return (
    <button
      className={`${styles.spine} ${isOpen ? styles.open : ''} ${styles[density]}`}
      style={{
        width: scaledWidth,
        backgroundColor: spineColor.bg,
        color: spineColor.text,
      }}
      onClick={onClick}
      aria-label={`Open ${label} - ${chapters.length} events`}
      title={`${label}\n${chapters.length} event${chapters.length !== 1 ? 's' : ''}`}
    >
      {/* Book spine edge highlight */}
      <div className={styles.edgeHighlight} />

      {/* Title area - rotated text */}
      <div className={styles.titleArea}>
        <span className={styles.title}>{label}</span>
      </div>

      {/* Event distribution markers */}
      <div className={styles.markerArea}>
        {eventMarkers.map(marker => (
          <div
            key={marker.key}
            className={styles.eventMarker}
            style={{
              top: `${10 + marker.position * 80}%`,
            }}
          />
        ))}
        {hasMoreEvents && (
          <div className={styles.moreIndicator}>...</div>
        )}
      </div>

      {/* Event count badge */}
      <div className={styles.countBadge}>
        {chapters.length}
      </div>

      {/* Decorative elements */}
      <div className={styles.topEdge} />
      <div className={styles.bottomEdge} />
    </button>
  );
};
