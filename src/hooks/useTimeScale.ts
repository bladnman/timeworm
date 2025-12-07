import { useMemo } from 'react';
import type { TimelineData } from '../types/timeline';
import {
  parseISOExtended,
  differenceInYears,
  getYear,
  fromYear,
  eachYearOfInterval,
  type ParsedDate,
} from '../utils/dateUtils';

interface TimeScaleConfig {
  pixelsPerYear: number;
}

export interface TimeScaleResult {
  totalWidth: number;
  getPosition: (dateStr: string) => number;
  minDate: ParsedDate;
  maxDate: ParsedDate;
  totalYears: number;
  years: number[];
}

export const useTimeScale = (data: TimelineData | null, config: TimeScaleConfig): TimeScaleResult => {
  const scale = useMemo(() => {
    const emptyResult: TimeScaleResult = {
      totalWidth: 0,
      getPosition: () => 0,
      minDate: fromYear(0),
      maxDate: fromYear(0),
      totalYears: 0,
      years: [],
    };

    if (!data || data.events.length === 0) {
      return emptyResult;
    }

    // Sort events to find absolute range
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    const minDateRaw = parseISOExtended(sortedEvents[0].date_start);
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    const maxDateRaw = parseISOExtended(lastEvent.date_end || lastEvent.date_start);

    // Padding: Start 50 years before first event, End 20 years after last
    const minDate = fromYear(getYear(minDateRaw) - 50);
    const maxDate = fromYear(getYear(maxDateRaw) + 20);

    const totalYears = differenceInYears(minDate, maxDate);
    const totalWidth = totalYears * config.pixelsPerYear;

    const getPosition = (dateStr: string): number => {
      const date = parseISOExtended(dateStr);
      const yearsFromStart = differenceInYears(minDate, date);
      return yearsFromStart * config.pixelsPerYear;
    };

    const years = eachYearOfInterval(minDate, maxDate);

    return { totalWidth, getPosition, minDate, maxDate, totalYears, years };
  }, [data, config.pixelsPerYear]);

  return scale;
};
