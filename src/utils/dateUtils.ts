/**
 * Date utilities for handling BCE (negative year) dates.
 *
 * date-fns parseISO doesn't handle ISO 8601 extended format with negative years,
 * so we need custom parsing for BCE dates like "-0150-01-01".
 */

export interface ParsedDate {
  year: number;      // Negative for BCE
  month: number;     // 1-12
  day: number;       // 1-31
  decimalYear: number; // Year as decimal (e.g., 2025.5 for mid-2025)
}

/**
 * Parse an ISO date string, including BCE dates with negative years.
 * Handles formats like: "2025-01-15", "-0150-01-01", "1804-01-01"
 */
export const parseISOExtended = (dateStr: string): ParsedDate => {
  const isNegative = dateStr.startsWith('-');
  const normalized = isNegative ? dateStr.slice(1) : dateStr;
  const parts = normalized.split('-');

  const year = parseInt(parts[0], 10) * (isNegative ? -1 : 1);
  const month = parseInt(parts[1], 10) || 1;
  const day = parseInt(parts[2]?.split('T')[0], 10) || 1;

  // Convert to decimal year for linear calculations
  const dayOfYear = getDayOfYear(month, day);
  const daysInYear = 365.25;
  const decimalYear = year + (dayOfYear - 1) / daysInYear;

  return { year, month, day, decimalYear };
};

/**
 * Get approximate day of year (1-366) from month and day.
 */
const getDayOfYear = (month: number, day: number): number => {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayOfYear = day;
  for (let i = 0; i < month - 1; i++) {
    dayOfYear += daysPerMonth[i];
  }
  return dayOfYear;
};

/**
 * Calculate the difference in years between two dates.
 * Returns positive if date2 > date1.
 */
export const differenceInYears = (date1: ParsedDate, date2: ParsedDate): number => {
  return date2.decimalYear - date1.decimalYear;
};

/**
 * Get the year from a ParsedDate.
 */
export const getYear = (date: ParsedDate): number => {
  return date.year;
};

/**
 * Create a ParsedDate from a year number (e.g., for padding calculations).
 */
export const fromYear = (year: number): ParsedDate => {
  return {
    year,
    month: 1,
    day: 1,
    decimalYear: year,
  };
};

/**
 * Generate an array of year numbers between two ParsedDates.
 */
export const eachYearOfInterval = (start: ParsedDate, end: ParsedDate): number[] => {
  const years: number[] = [];
  const startYear = Math.ceil(start.year);
  const endYear = Math.floor(end.year);

  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  return years;
};
