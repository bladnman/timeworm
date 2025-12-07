import type { Book, Chapter } from '../../hooks/useLibraryShelfView';
import styles from './BookDetail.module.css';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onSelectChapter: (eventId: string) => void;
}

/**
 * BookDetail displays the contents of an "opened" book.
 * Shows events as chapters in a table-of-contents style layout.
 */
export const BookDetail = ({ book, onClose, onSelectChapter }: BookDetailProps) => {
  const { label, chapters, spineColor, startYear, endYear } = book;

  // Format the year range for display
  const yearRange = startYear < 0
    ? `${Math.abs(startYear)} - ${Math.abs(endYear)} BCE`
    : `${startYear} - ${endYear}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.book}
        onClick={e => e.stopPropagation()}
        style={{
          '--book-color': spineColor.bg,
          '--book-text': spineColor.text,
        } as React.CSSProperties}
      >
        {/* Book cover */}
        <div className={styles.cover}>
          <div className={styles.coverDecor} />
          <h2 className={styles.coverTitle}>{label}</h2>
          <div className={styles.coverSubtitle}>{yearRange}</div>
          <div className={styles.coverChapterCount}>
            {chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table of contents / Chapter list */}
        <div className={styles.contents}>
          <div className={styles.contentsHeader}>
            <h3 className={styles.contentsTitle}>Contents</h3>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close book"
            >
              &times;
            </button>
          </div>

          <ul className={styles.chapterList}>
            {chapters.map((chapter, index) => (
              <ChapterEntry
                key={chapter.event.id}
                chapter={chapter}
                index={index + 1}
                onClick={() => onSelectChapter(chapter.event.id)}
              />
            ))}
          </ul>

          {chapters.length === 0 && (
            <div className={styles.emptyState}>
              No events recorded in this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ChapterEntryProps {
  chapter: Chapter;
  index: number;
  onClick: () => void;
}

/**
 * ChapterEntry renders a single event as a chapter in the book.
 */
const ChapterEntry = ({ chapter, index, onClick }: ChapterEntryProps) => {
  const { event, parsedDate } = chapter;

  // Format date for display
  const dateLabel = parsedDate.year < 0
    ? `${Math.abs(parsedDate.year)} BCE`
    : parsedDate.year.toString();

  return (
    <li className={styles.chapter}>
      <button className={styles.chapterButton} onClick={onClick}>
        <span className={styles.chapterNumber}>{index}</span>
        <div className={styles.chapterContent}>
          <span className={styles.chapterTitle}>{event.title}</span>
          <span className={styles.chapterDate}>{dateLabel}</span>
        </div>
        <span className={styles.chapterArrow}>&rarr;</span>
      </button>
    </li>
  );
};
