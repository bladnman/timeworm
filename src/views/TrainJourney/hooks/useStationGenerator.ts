import { useMemo } from 'react';
import type { ParsedDate } from '../../../utils/dateUtils';
import { GRANULARITY_THRESHOLDS, type Station, type StationType } from '../constants';

interface UseStationGeneratorConfig {
  minDate: ParsedDate;
  maxDate: ParsedDate;
  totalYears: number;
  pixelsPerYear: number;
}

/**
 * Generates stations (time markers) along the track based on the time span.
 * Adapts granularity based on the total years covered.
 */
export const useStationGenerator = (config: UseStationGeneratorConfig): Station[] => {
  const { minDate, maxDate, totalYears, pixelsPerYear } = config;

  return useMemo(() => {
    if (totalYears <= 0) return [];

    const stations: Station[] = [];

    // Determine granularity based on time span
    let interval: number;
    let majorInterval: number;

    if (totalYears > GRANULARITY_THRESHOLDS.centuries) {
      interval = 100;      // Every century
      majorInterval = 500; // Every 5 centuries is major
    } else if (totalYears > GRANULARITY_THRESHOLDS.decades) {
      interval = 10;       // Every decade
      majorInterval = 50;  // Every 50 years is major
    } else if (totalYears > GRANULARITY_THRESHOLDS.years) {
      interval = 1;        // Every year
      majorInterval = 10;  // Every decade is major
    } else {
      interval = 1;        // Every year
      majorInterval = 5;   // Every 5 years is major
    }

    // Round start year down to nearest interval
    const startYear = Math.floor(minDate.year / interval) * interval;
    const endYear = Math.ceil(maxDate.year / interval) * interval;

    // Generate stations at each interval
    for (let year = startYear; year <= endYear; year += interval) {
      const yearsFromStart = year - minDate.year;
      const xPos = yearsFromStart * pixelsPerYear;

      // Determine station type
      let type: StationType;
      if (year === startYear || year === endYear) {
        type = 'terminus';
      } else if (year % majorInterval === 0) {
        type = 'major';
      } else {
        type = 'minor';
      }

      // Format label based on granularity
      let label: string;
      if (year < 0) {
        label = `${Math.abs(year)} BCE`;
      } else if (year < 1000) {
        label = `${year} CE`;
      } else {
        label = year.toString();
      }

      stations.push({
        id: `station-${year}`,
        year,
        label,
        type,
        xPos,
      });
    }

    return stations;
  }, [minDate.year, maxDate.year, totalYears, pixelsPerYear]);
};
