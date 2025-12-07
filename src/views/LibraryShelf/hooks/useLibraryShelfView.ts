import { useMemo, useState, useCallback } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import type { TimelineEvent } from '../../../types/timeline';
import { parseISOExtended, type ParsedDate } from '../../../utils/dateUtils';
import { LIBRARY_SHELF_CONFIG, SPINE_COLORS, type SpineColor } from './constants';

/**
 * A "Book" represents a contiguous time segment containing events as "chapters"
 */
export interface Book {
  id: string;
  startYear: number;
  endYear: number;
  label: string;              // Display label (e.g., "1990s", "2010-2015")
  chapters: Chapter[];
  spineWidth: number;         // Calculated width based on duration/density
  spineColor: SpineColor;
  density: 'sparse' | 'normal' | 'dense';
  gapYearsBefore: number | null;  // Gap from previous book
  showGapIndicator: boolean;
}

/**
 * A "Chapter" is an event within a book
 */
export interface Chapter {
  event: TimelineEvent;
  parsedDate: ParsedDate;
  relativePosition: number;   // 0-1 position within the book's time span
}

/**
 * Determines how to partition the timeline into books based on data density
 */
const calculateSegmentSize = (events: TimelineEvent[]): number => {
  if (events.length === 0) return LIBRARY_SHELF_CONFIG.defaultSegmentYears;

  const sorted = [...events].sort((a, b) => {
    const dateA = parseISOExtended(a.date_start);
    const dateB = parseISOExtended(b.date_start);
    return dateA.decimalYear - dateB.decimalYear;
  });

  const firstDate = parseISOExtended(sorted[0].date_start);
  const lastDate = parseISOExtended(sorted[sorted.length - 1].date_start);
  const totalYears = Math.abs(lastDate.year - firstDate.year);
  const avgEventsPerYear = events.length / Math.max(totalYears, 1);

  // Adjust segment size based on density
  if (avgEventsPerYear > 2) {
    return 5;  // Dense data: 5-year segments
  } else if (avgEventsPerYear > 0.5) {
    return 10; // Normal: decades
  } else if (avgEventsPerYear > 0.1) {
    return 25; // Sparse: quarter-centuries
  } else {
    return 50; // Very sparse: half-centuries
  }
};

/**
 * Generates a label for a time segment
 */
const generateBookLabel = (startYear: number, endYear: number): string => {
  const isBCE = startYear < 0;
  const span = endYear - startYear;

  if (span <= 1) {
    return isBCE ? `${Math.abs(startYear)} BCE` : `${startYear}`;
  }

  if (span === 10 && startYear % 10 === 0) {
    // Decade format
    return isBCE
      ? `${Math.abs(startYear)}s BCE`
      : `${startYear}s`;
  }

  // Range format
  const startLabel = isBCE ? `${Math.abs(startYear)} BCE` : `${startYear}`;
  const endLabel = isBCE ? `${Math.abs(endYear)} BCE` : `${endYear}`;
  return `${startLabel} - ${endLabel}`;
};

/**
 * Calculates spine width based on event count and duration
 */
const calculateSpineWidth = (
  chapters: Chapter[],
  duration: number,
  segmentSize: number
): number => {
  const { minSpineWidth, maxSpineWidth } = LIBRARY_SHELF_CONFIG;

  // Base width on event count, scaled by duration
  const eventFactor = Math.min(chapters.length / 5, 2); // 1-2x based on events
  const durationFactor = Math.min(duration / segmentSize, 1.5); // Up to 1.5x for longer spans

  const width = minSpineWidth * (1 + eventFactor * 0.5 + durationFactor * 0.3);
  return Math.min(Math.max(width, minSpineWidth), maxSpineWidth);
};

/**
 * Determines density classification
 */
const classifyDensity = (eventCount: number): 'sparse' | 'normal' | 'dense' => {
  if (eventCount <= LIBRARY_SHELF_CONFIG.sparseThreshold) return 'sparse';
  if (eventCount >= LIBRARY_SHELF_CONFIG.denseThreshold) return 'dense';
  return 'normal';
};

/**
 * Main hook for Library Shelf view
 */
export const useLibraryShelfView = () => {
  const { data, selectEvent, isLoading } = useTimeline();
  const [openBookId, setOpenBookId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Partition events into books
  const books = useMemo((): Book[] => {
    if (!data?.events || data.events.length === 0) return [];

    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    const segmentSize = calculateSegmentSize(sortedEvents);

    // Group events by time segment
    const bookMap = new Map<number, { events: TimelineEvent[]; parsed: ParsedDate[] }>();

    sortedEvents.forEach(event => {
      const parsed = parseISOExtended(event.date_start);
      // Calculate segment start (aligned to segment boundaries)
      const segmentStart = Math.floor(parsed.year / segmentSize) * segmentSize;

      if (!bookMap.has(segmentStart)) {
        bookMap.set(segmentStart, { events: [], parsed: [] });
      }
      const bucket = bookMap.get(segmentStart)!;
      bucket.events.push(event);
      bucket.parsed.push(parsed);
    });

    // Convert map to sorted books array
    const sortedSegments = Array.from(bookMap.entries()).sort((a, b) => a[0] - b[0]);
    let colorIndex = 0;
    let previousEndYear: number | null = null;

    return sortedSegments.map(([segmentStart, { events, parsed }]) => {
      const startYear = segmentStart;
      const endYear = segmentStart + segmentSize;

      // Calculate chapters with relative positions
      const chapters: Chapter[] = events.map((event, i) => {
        const parsedDate = parsed[i];
        const relativePosition = segmentSize > 0
          ? (parsedDate.year - startYear) / segmentSize
          : 0.5;
        return { event, parsedDate, relativePosition };
      });

      // Calculate gap from previous book
      const gapYearsBefore = previousEndYear !== null
        ? startYear - previousEndYear
        : null;
      const showGapIndicator = gapYearsBefore !== null &&
        gapYearsBefore >= LIBRARY_SHELF_CONFIG.gapThresholdYears;

      previousEndYear = endYear;

      const book: Book = {
        id: `book-${startYear}-${endYear}`,
        startYear,
        endYear,
        label: generateBookLabel(startYear, endYear),
        chapters,
        spineWidth: calculateSpineWidth(chapters, endYear - startYear, segmentSize),
        spineColor: SPINE_COLORS[colorIndex % SPINE_COLORS.length],
        density: classifyDensity(chapters.length),
        gapYearsBefore,
        showGapIndicator,
      };

      colorIndex++;
      return book;
    });
  }, [data?.events]);

  // Calculate total shelf width
  const totalWidth = useMemo(() => {
    const booksWidth = books.reduce((sum, book) => sum + book.spineWidth, 0);
    const gapsWidth = (books.length - 1) * LIBRARY_SHELF_CONFIG.spineGap;
    const padding = LIBRARY_SHELF_CONFIG.shelfPadding * 2;
    return (booksWidth + gapsWidth + padding) * zoom;
  }, [books, zoom]);

  // Get the currently opened book
  const openBook = useMemo(() => {
    if (!openBookId) return null;
    return books.find(b => b.id === openBookId) || null;
  }, [books, openBookId]);

  // Handlers
  const handleOpenBook = useCallback((bookId: string) => {
    setOpenBookId(bookId);
  }, []);

  const handleCloseBook = useCallback(() => {
    setOpenBookId(null);
  }, []);

  const handleSelectChapter = useCallback((eventId: string) => {
    selectEvent(eventId);
  }, [selectEvent]);

  const handleZoomChange = useCallback((newZoom: number) => {
    const { zoomMin, zoomMax } = LIBRARY_SHELF_CONFIG;
    setZoom(Math.min(Math.max(newZoom, zoomMin), zoomMax));
  }, []);

  return {
    books,
    openBook,
    openBookId,
    totalWidth,
    zoom,
    isLoading,
    handlers: {
      openBook: handleOpenBook,
      closeBook: handleCloseBook,
      selectChapter: handleSelectChapter,
      zoomChange: handleZoomChange,
    },
    config: LIBRARY_SHELF_CONFIG,
  };
};
