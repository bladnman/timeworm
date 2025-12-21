import { useMemo } from 'react';
import type { TimelineData } from '../types/timeline';
import {
  parseISOExtended,
  differenceInYears,
  fromYear,
  eachYearOfInterval,
  type ParsedDate,
} from '../utils/dateUtils';

interface TimeScaleConfig {
  pixelsPerYear: number;
  /** Padding before first event (in years). Default: proportional to data span */
  paddingBefore?: number;
  /** Padding after last event (in years). Default: proportional to data span */
  paddingAfter?: number;
}

/** Raw data bounds without any padding applied */
export interface DataBounds {
  minDecimalYear: number;
  maxDecimalYear: number;
  spanYears: number;
  eventCount: number;
  /** Sorted array of all event positions in decimal years */
  eventYears: number[];
}

/**
 * Get the raw data bounds (min/max dates, span) without padding.
 * Useful for computing auto-fit zoom before calling useTimeScale.
 */
export function getDataBounds(data: TimelineData | null): DataBounds | null {
  if (!data || data.events.length === 0) return null;

  const eventYears = data.events.map((e) => parseISOExtended(e.date_start).decimalYear);
  eventYears.sort((a, b) => a - b);

  const minDateRaw = parseISOExtended(data.events.find((e) =>
    parseISOExtended(e.date_start).decimalYear === eventYears[0]
  )!.date_start);

  const lastEventDate = data.events.reduce((max, e) => {
    const endDate = parseISOExtended(e.date_end || e.date_start);
    return endDate.decimalYear > max.decimalYear ? endDate : max;
  }, parseISOExtended(data.events[0].date_start));

  const spanYears = differenceInYears(minDateRaw, lastEventDate);

  return {
    minDecimalYear: minDateRaw.decimalYear,
    maxDecimalYear: lastEventDate.decimalYear,
    spanYears: Math.max(spanYears, 1 / 365), // Minimum ~1 day
    eventCount: data.events.length,
    eventYears,
  };
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

    // Calculate data span for proportional padding
    const dataSpan = Math.max(differenceInYears(minDateRaw, maxDateRaw), 1/365); // Min 1 day span

    // Use provided padding or default to 10% of data span
    // No arbitrary minimum - let it be truly proportional
    const defaultPadding = dataSpan * 0.1;
    const paddingBefore = config.paddingBefore ?? defaultPadding;
    const paddingAfter = config.paddingAfter ?? defaultPadding;

    // Apply padding relative to actual data dates (keeping decimal precision)
    const minDecimalYear = minDateRaw.decimalYear - paddingBefore;
    const maxDecimalYear = maxDateRaw.decimalYear + paddingAfter;

    // For axis year generation, extend to nearest whole year boundaries
    // but keep the actual min/max decimal for positioning
    const minDate = fromYear(minDecimalYear);
    const maxDate = fromYear(maxDecimalYear);

    // Generate year ticks that span the visible range
    const minYearForTicks = Math.floor(minDecimalYear);
    const maxYearForTicks = Math.ceil(maxDecimalYear);

    const totalYears = differenceInYears(minDate, maxDate);
    const totalWidth = totalYears * config.pixelsPerYear;

    const getPosition = (dateStr: string): number => {
      const date = parseISOExtended(dateStr);
      const yearsFromStart = differenceInYears(minDate, date);
      return yearsFromStart * config.pixelsPerYear;
    };

    // Generate year ticks using the whole-number boundaries
    const years = eachYearOfInterval(
      fromYear(minYearForTicks),
      fromYear(maxYearForTicks)
    );

    return { totalWidth, getPosition, minDate, maxDate, totalYears, years };
  }, [data, config.pixelsPerYear, config.paddingBefore, config.paddingAfter]);

  return scale;
};
