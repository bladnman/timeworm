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

/** Days in each month (non-leap year) */
const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Get approximate day of year (1-366) from month and day.
 * Month is 1-indexed (1 = January).
 */
const getDayOfYear = (month: number, day: number): number => {
  let dayOfYear = day;
  for (let i = 0; i < month - 1; i++) {
    dayOfYear += DAYS_PER_MONTH[i];
  }
  return dayOfYear;
};

/**
 * Convert a date to decimal year representation.
 * This is the single source of truth for all date positioning.
 *
 * @param year - The year (e.g., 2025)
 * @param month - Month (1-indexed: 1 = January, 12 = December)
 * @param day - Day of month (1-31)
 * @returns Decimal year (e.g., 2025.5 for mid-2025)
 */
export const getDecimalYear = (year: number, month: number, day: number): number => {
  const dayOfYear = getDayOfYear(month, day);
  return year + (dayOfYear - 1) / 365.25;
};

/**
 * Get decimal year for the first day of a month.
 * Month is 0-indexed (0 = January) to match JavaScript Date conventions.
 * This is a convenience wrapper for tick generation.
 */
export const getMonthStartDecimalYear = (year: number, month0: number): number => {
  // Convert 0-indexed month to 1-indexed for getDecimalYear
  return getDecimalYear(year, month0 + 1, 1);
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

/**
 * Format a date string for human-readable display.
 * Handles BCE dates and generates appropriate display format.
 */
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';

  const parsed = parseISOExtended(dateStr);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[parsed.month - 1] || '';
  const year = parsed.year < 0 ? `${Math.abs(parsed.year)} BCE` : `${parsed.year}`;

  // If we only have year (month=1, day=1), just show year
  if (parsed.month === 1 && parsed.day === 1) {
    return year;
  }

  // If we have month but day is 1, show month and year
  if (parsed.day === 1) {
    return `${monthName} ${year}`;
  }

  // Full date
  return `${monthName} ${parsed.day}, ${year}`;
};

/**
 * Format a date range for display.
 * Shows just start if no end, or "Start - End" if both.
 */
export const formatDateRangeDisplay = (startStr: string, endStr?: string): string => {
  const start = formatDateDisplay(startStr);
  if (!endStr) return start;

  const end = formatDateDisplay(endStr);
  return `${start} – ${end}`;
};
