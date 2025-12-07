import { useLibraryShelfView } from './hooks/useLibraryShelfView';
import { BookSpine } from './components/BookSpine/BookSpine';
import { BookDetail } from './components/BookDetail/BookDetail';
import styles from './LibraryShelfView.module.css';

/**
 * LibraryShelfView - Timeline visualization as a shelf of books
 *
 * Core concept: Time is represented as books arranged chronologically on a shelf.
 * Each book represents a time segment (decade, era, etc.), and events within
 * that period are the "chapters" of the book.
 *
 * Navigation:
 * - Scroll horizontally to browse through time
 * - Hover on spines to see event count
 * - Click to "open" a book and view its chapters
 * - Click a chapter to select that event
 */
export const LibraryShelfView = () => {
  const {
    books,
    openBook,
    openBookId,
    totalWidth,
    zoom,
    isLoading,
    handlers,
    config,
  } = useLibraryShelfView();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span>Loading timeline...</span>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>&#128218;</span>
        <span>No books to display</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Zoom controls */}
      <div className={styles.controls}>
        <button
          className={styles.zoomButton}
          onClick={() => handlers.zoomChange(zoom - config.zoomStep)}
          disabled={zoom <= config.zoomMin}
          aria-label="Zoom out"
        >
          &minus;
        </button>
        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <button
          className={styles.zoomButton}
          onClick={() => handlers.zoomChange(zoom + config.zoomStep)}
          disabled={zoom >= config.zoomMax}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {/* Shelf container with horizontal scroll */}
      <div className={styles.shelfContainer}>
        <div className={styles.shelfWrapper} style={{ width: totalWidth }}>
          {/* The shelf with books */}
          <div className={styles.shelf}>
            {/* Book spines */}
            <div className={styles.books}>
              {books.map((book) => (
                <div key={book.id} className={styles.bookSlot}>
                  {/* Gap indicator for large time jumps */}
                  {book.showGapIndicator && (
                    <div className={styles.gapIndicator}>
                      <span className={styles.gapLine} />
                      <span className={styles.gapLabel}>
                        {formatGap(book.gapYearsBefore!)}
                      </span>
                      <span className={styles.gapLine} />
                    </div>
                  )}

                  <BookSpine
                    book={book}
                    isOpen={book.id === openBookId}
                    zoom={zoom}
                    onClick={() => handlers.openBook(book.id)}
                  />
                </div>
              ))}
            </div>

            {/* Shelf ledge */}
            <div className={styles.shelfLedge}>
              <div className={styles.ledgeTop} />
              <div className={styles.ledgeFront} />
            </div>
          </div>

          {/* Timeline markers below shelf */}
          <div className={styles.timeline}>
            {books.map((book, index) => {
              // Show label for first book, and every ~4th book for visual clarity
              const showLabel = index === 0 || index % 4 === 0;
              return showLabel ? (
                <div
                  key={`label-${book.id}`}
                  className={styles.timeLabel}
                  style={{
                    left: calculateBookPosition(books, index, zoom, config.spineGap),
                  }}
                >
                  {book.startYear < 0
                    ? `${Math.abs(book.startYear)} BCE`
                    : book.startYear}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Opened book detail view */}
      {openBook && (
        <BookDetail
          book={openBook}
          onClose={handlers.closeBook}
          onSelectChapter={handlers.selectChapter}
        />
      )}
    </div>
  );
};

/**
 * Format gap years for display
 */
const formatGap = (years: number): string => {
  if (years >= 1000) {
    return `~${Math.round(years / 100) / 10}k years`;
  }
  if (years >= 100) {
    const centuries = Math.round(years / 100);
    return `~${centuries} ${centuries === 1 ? 'century' : 'centuries'}`;
  }
  return `${years} years`;
};

/**
 * Calculate horizontal position for a book on the shelf
 */
const calculateBookPosition = (
  books: { spineWidth: number }[],
  index: number,
  zoom: number,
  gap: number
): number => {
  let position = 32; // Initial padding
  for (let i = 0; i < index; i++) {
    position += books[i].spineWidth * zoom + gap;
  }
  return position;
};
