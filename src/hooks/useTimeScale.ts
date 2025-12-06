import { differenceInDays, getYear, parseISO } from 'date-fns';
import { useMemo } from 'react';
import type { TimelineData } from '../types/timeline';

interface TimeScaleConfig {
  pixelsPerYear: number;
}

export const useTimeScale = (data: TimelineData | null, config: TimeScaleConfig) => {
  const scale = useMemo(() => {
    if (!data || data.events.length === 0) {
      return { totalWidth: 0, getPosition: () => 0, minDate: new Date(), maxDate: new Date() };
    }

    // Sort events to find absolute range
    const sortedEvents = [...data.events].sort((a, b) => 
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );

    const minDateRaw = parseISO(sortedEvents[0].date_start);
    const maxDateRaw = parseISO(sortedEvents[sortedEvents.length - 1].date_end || sortedEvents[sortedEvents.length - 1].date_start);

    // Padding: Start 50 years before first event, End 20 years after last
    const minDate = new Date(getYear(minDateRaw) - 50, 0, 1);
    // Since dates can be BC (negative years), we need careful handling, but date-fns handles ISO parsing well.
    // The data uses "-0150-01-01" for 150 BCE.
    
    // For max date, ensure we cover the full range
    const maxDate = new Date(getYear(maxDateRaw) + 20, 0, 1);

    const totalDays = differenceInDays(maxDate, minDate);
    const totalYears = totalDays / 365.25;
    const totalWidth = totalYears * config.pixelsPerYear;

    const getPosition = (dateStr: string) => {
      const date = parseISO(dateStr);
      const daysFromStart = differenceInDays(date, minDate);
      const pos = (daysFromStart / 365.25) * config.pixelsPerYear;
      return pos;
    };

    return { totalWidth, getPosition, minDate, maxDate };
  }, [data, config.pixelsPerYear]);

  return scale;
};
