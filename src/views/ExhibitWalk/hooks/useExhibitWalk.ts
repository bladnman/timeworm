import { useMemo, useState, useCallback, useRef } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import {
  parseISOExtended,
  differenceInYears,
  type ParsedDate,
} from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';
import { EXHIBIT_WALK_CONFIG, type ExhibitBaySize } from './constants';

/**
 * An exhibit bay containing one or more events from a time segment.
 */
export interface ExhibitBay {
  id: string;
  events: TimelineEvent[];
  startDate: ParsedDate;
  endDate: ParsedDate;
  label: string; // Display label for the time period
  size: ExhibitBaySize;
  yearSpan: number; // Duration of this bay in years
  gapFromPrevious: number | null; // Years gap from previous bay
  xPosition: number; // Calculated x position
  width: number; // Calculated width
}

interface UseExhibitWalkResult {
  bays: ExhibitBay[];
  totalWidth: number;
  expandedBayId: string | null;
  hoveredBayId: string | null;
  selectEvent: (id: string | null) => void;
  expandBay: (id: string | null) => void;
  setHoveredBay: (id: string | null) => void;
  scrollToBay: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
}

/**
 * Format a time range for display as a bay label.
 */
const formatBayLabel = (startDate: ParsedDate, endDate: ParsedDate): string => {
  const startYear = startDate.year;
  const endYear = endDate.year;

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year}`;
  };

  if (startYear === endYear) {
    return formatYear(startYear);
  }

  // Check if same decade
  const startDecade = Math.floor(startYear / 10);
  const endDecade = Math.floor(endYear / 10);
  if (startDecade === endDecade) {
    return `${formatYear(startYear)}–${formatYear(endYear)}`;
  }

  // Different decades - show range
  return `${formatYear(startYear)} – ${formatYear(endYear)}`;
};

/**
 * Determine bay size based on event count and time span.
 */
const getBaySize = (eventCount: number, yearSpan: number): ExhibitBaySize => {
  if (eventCount === 1 && yearSpan <= 1) return 'compact';
  if (eventCount <= 3 && yearSpan <= 10) return 'standard';
  return 'expanded';
};

/**
 * Calculate bay width based on event count and size.
 */
const calculateBayWidth = (
  eventCount: number,
  size: ExhibitBaySize
): number => {
  const { bayMinWidth, bayMaxWidth, bayWidthPerEvent } = EXHIBIT_WALK_CONFIG;

  const baseWidth =
    size === 'compact'
      ? bayMinWidth
      : size === 'standard'
        ? bayMinWidth + 60
        : bayMinWidth + 120;

  const eventWidth = Math.max(0, eventCount - 1) * bayWidthPerEvent;
  return Math.min(bayMaxWidth, baseWidth + eventWidth);
};

/**
 * Calculate gap between bays based on temporal distance.
 */
const calculateBayGap = (yearsGap: number | null): number => {
  const { bayGap, bayGapPerYear } = EXHIBIT_WALK_CONFIG;

  if (yearsGap === null) return 0;

  // Scale gap based on temporal distance, with diminishing returns
  const additionalGap = Math.min(100, Math.sqrt(yearsGap) * bayGapPerYear * 3);
  return bayGap + additionalGap;
};

export const useExhibitWalk = (): UseExhibitWalkResult => {
  const { data, selectEvent } = useTimeline();
  const [expandedBayId, setExpandedBayId] = useState<string | null>(null);
  const [hoveredBayId, setHoveredBayId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Partition events into exhibit bays based on temporal clustering.
   */
  const bays = useMemo((): ExhibitBay[] => {
    if (!data || data.events.length === 0) return [];

    const { gapThresholdYears, maxEventsPerBay, corridorPadding } =
      EXHIBIT_WALK_CONFIG;

    // Sort events chronologically
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    const result: ExhibitBay[] = [];
    let currentBayEvents: TimelineEvent[] = [];
    let currentBayStartDate: ParsedDate | null = null;
    let currentBayEndDate: ParsedDate | null = null;
    let previousBayEndDate: ParsedDate | null = null;

    const finalizeBay = () => {
      if (currentBayEvents.length === 0 || !currentBayStartDate) return;

      const yearSpan = currentBayEndDate
        ? differenceInYears(currentBayStartDate, currentBayEndDate)
        : 0;

      const gapFromPrevious = previousBayEndDate
        ? differenceInYears(previousBayEndDate, currentBayStartDate)
        : null;

      const size = getBaySize(currentBayEvents.length, yearSpan);
      const width = calculateBayWidth(currentBayEvents.length, size);

      result.push({
        id: `bay-${result.length}`,
        events: [...currentBayEvents],
        startDate: currentBayStartDate,
        endDate: currentBayEndDate || currentBayStartDate,
        label: formatBayLabel(
          currentBayStartDate,
          currentBayEndDate || currentBayStartDate
        ),
        size,
        yearSpan: Math.max(0, yearSpan),
        gapFromPrevious,
        xPosition: 0, // Will be calculated below
        width,
      });

      previousBayEndDate = currentBayEndDate || currentBayStartDate;
      currentBayEvents = [];
      currentBayStartDate = null;
      currentBayEndDate = null;
    };

    // Partition events into bays
    for (const event of sortedEvents) {
      const eventDate = parseISOExtended(event.date_start);
      const eventEndDate = event.date_end
        ? parseISOExtended(event.date_end)
        : eventDate;

      // Check if we should start a new bay
      if (currentBayEvents.length > 0 && currentBayEndDate) {
        const gapFromCurrentBay = differenceInYears(currentBayEndDate, eventDate);

        const shouldStartNewBay =
          gapFromCurrentBay >= gapThresholdYears ||
          currentBayEvents.length >= maxEventsPerBay;

        if (shouldStartNewBay) {
          finalizeBay();
        }
      }

      // Add event to current bay
      currentBayEvents.push(event);

      if (!currentBayStartDate) {
        currentBayStartDate = eventDate;
      }

      // Update end date to the latest date in the bay
      if (
        !currentBayEndDate ||
        eventEndDate.decimalYear > currentBayEndDate.decimalYear
      ) {
        currentBayEndDate = eventEndDate;
      }
    }

    // Finalize the last bay
    finalizeBay();

    // Calculate x positions
    let xPos = corridorPadding;
    for (const bay of result) {
      const gap = calculateBayGap(bay.gapFromPrevious);
      xPos += gap;
      bay.xPosition = xPos;
      xPos += bay.width;
    }

    return result;
  }, [data]);

  /**
   * Calculate total corridor width.
   */
  const totalWidth = useMemo(() => {
    if (bays.length === 0) return 0;
    const lastBay = bays[bays.length - 1];
    return lastBay.xPosition + lastBay.width + EXHIBIT_WALK_CONFIG.corridorPadding;
  }, [bays]);

  /**
   * Expand a bay to show more details.
   */
  const expandBay = useCallback((id: string | null) => {
    setExpandedBayId((current) => (current === id ? null : id));
  }, []);

  /**
   * Scroll the corridor to center a specific bay.
   */
  const scrollToBay = useCallback(
    (id: string) => {
      const bay = bays.find((b) => b.id === id);
      if (!bay || !containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const targetScroll = bay.xPosition - containerWidth / 2 + bay.width / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    },
    [bays]
  );

  return {
    bays,
    totalWidth,
    expandedBayId,
    hoveredBayId,
    selectEvent,
    expandBay,
    setHoveredBay: setHoveredBayId,
    scrollToBay,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    isLoading: !data,
  };
};
