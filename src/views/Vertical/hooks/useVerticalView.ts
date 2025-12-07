import { useMemo } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { parseISOExtended, differenceInYears } from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';

interface TimelineItemWithGap {
  event: TimelineEvent;
  gapYears: number | null; // Gap BEFORE this event (null for first)
  showGapIndicator: boolean;
}

// Show gap indicator if gap is larger than this threshold
const GAP_THRESHOLD_YEARS = 50;

export const useVerticalView = () => {
  const { data, selectEvent } = useTimeline();

  const items = useMemo((): TimelineItemWithGap[] => {
    if (!data || data.events.length === 0) return [];

    // Sort events by date
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    return sortedEvents.map((event, index) => {
      if (index === 0) {
        return { event, gapYears: null, showGapIndicator: false };
      }

      const prevEvent = sortedEvents[index - 1];
      const prevDate = parseISOExtended(prevEvent.date_end || prevEvent.date_start);
      const currDate = parseISOExtended(event.date_start);
      const gapYears = differenceInYears(prevDate, currDate);

      return {
        event,
        gapYears,
        showGapIndicator: gapYears >= GAP_THRESHOLD_YEARS,
      };
    });
  }, [data]);

  return {
    items,
    selectEvent,
    isLoading: !data,
  };
};

/**
 * Format a time gap for display.
 * - < 100 years: "X years"
 * - 100-999 years: "X centuries"
 * - >= 1000 years: "X millennia" or "X,XXX years"
 */
export const formatGap = (years: number): string => {
  const absYears = Math.abs(Math.round(years));

  if (absYears < 100) {
    return `${absYears} years`;
  } else if (absYears < 1000) {
    const centuries = Math.round(absYears / 100);
    return centuries === 1 ? '~1 century' : `~${centuries} centuries`;
  } else {
    // Format with comma separators for large numbers
    return `~${absYears.toLocaleString()} years`;
  }
};
