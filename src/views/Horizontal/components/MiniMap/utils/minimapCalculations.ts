import { MINIMAP_CONFIG } from '../../../hooks/constants';

/**
 * Convert a year to a percentage position within the minimap's displayed range
 */
export function yearToMinimapPercent(
  year: number,
  rangeStart: number,
  rangeEnd: number
): number {
  const range = rangeEnd - rangeStart;
  if (range <= 0) return 0;
  return ((year - rangeStart) / range) * 100;
}

/**
 * Convert a percentage position within the minimap to a year
 */
export function minimapPercentToYear(
  percent: number,
  rangeStart: number,
  rangeEnd: number
): number {
  const range = rangeEnd - rangeStart;
  return rangeStart + (percent / 100) * range;
}

/**
 * Calculate viewport indicator bounds within the minimap's coordinate system
 */
export function getViewportIndicatorBounds(
  viewportOffset: number,
  viewportWidth: number,
  pixelsPerYear: number,
  totalMinYear: number,
  minimapRangeStart: number,
  minimapRangeEnd: number
): {
  leftPercent: number;
  widthPercent: number;
  isClipped: boolean;
  visibleLeftPercent: number;
  visibleWidthPercent: number;
} {
  // Calculate main viewport in year-space
  const mainViewportStartYear = viewportOffset / pixelsPerYear + totalMinYear;
  const mainViewportYears = viewportWidth / pixelsPerYear;

  const minimapYears = minimapRangeEnd - minimapRangeStart;
  if (minimapYears <= 0) {
    return {
      leftPercent: 0,
      widthPercent: 100,
      isClipped: false,
      visibleLeftPercent: 0,
      visibleWidthPercent: 100,
    };
  }

  // Calculate position relative to minimap's range (can be negative or > 100)
  const leftPercent = yearToMinimapPercent(mainViewportStartYear, minimapRangeStart, minimapRangeEnd);
  const widthPercent = (mainViewportYears / minimapYears) * 100;

  // Check if viewport extends beyond minimap bounds
  const isClipped = leftPercent < 0 || leftPercent + widthPercent > 100;

  // Calculate visible (clamped) portion
  let visibleLeftPercent = Math.max(0, leftPercent);
  let visibleWidthPercent = widthPercent;

  if (leftPercent < 0) {
    visibleWidthPercent += leftPercent; // Reduce width by the amount off-screen
  }
  if (visibleLeftPercent + visibleWidthPercent > 100) {
    visibleWidthPercent = 100 - visibleLeftPercent;
  }

  return {
    leftPercent,
    widthPercent,
    isClipped,
    visibleLeftPercent: Math.max(0, visibleLeftPercent),
    visibleWidthPercent: Math.max(0, visibleWidthPercent),
  };
}

/**
 * Calculate new minimap range to center around the main viewport
 * with the viewport indicator at approximately targetViewportPercent width
 */
export function recenterMinimapAroundViewport(
  viewportOffset: number,
  viewportWidth: number,
  pixelsPerYear: number,
  totalMinYear: number,
  totalMaxYear: number
): { rangeStart: number; rangeEnd: number } {
  const { targetViewportPercent, minYearsVisible } = MINIMAP_CONFIG;
  const totalYears = totalMaxYear - totalMinYear;

  // Calculate main viewport in year-space
  const mainViewportStartYear = viewportOffset / pixelsPerYear + totalMinYear;
  const mainViewportYears = viewportWidth / pixelsPerYear;
  const mainViewportCenterYear = mainViewportStartYear + mainViewportYears / 2;

  // Calculate desired minimap range to make viewport ~targetViewportPercent
  const desiredRange = mainViewportYears / (targetViewportPercent / 100);

  // Clamp to valid range
  const clampedRange = Math.max(minYearsVisible, Math.min(totalYears, desiredRange));

  // Center on viewport
  let rangeStart = mainViewportCenterYear - clampedRange / 2;
  let rangeEnd = mainViewportCenterYear + clampedRange / 2;

  // Clamp to total timeline bounds
  if (rangeStart < totalMinYear) {
    rangeStart = totalMinYear;
    rangeEnd = totalMinYear + clampedRange;
  }
  if (rangeEnd > totalMaxYear) {
    rangeEnd = totalMaxYear;
    rangeStart = totalMaxYear - clampedRange;
  }

  // Final clamp for rangeStart in case clampedRange > totalYears
  rangeStart = Math.max(totalMinYear, rangeStart);

  return { rangeStart, rangeEnd };
}

/**
 * Pan the minimap range by a delta (in years), clamping to bounds
 */
export function panMinimapRange(
  currentStart: number,
  currentEnd: number,
  deltaYears: number,
  totalMinYear: number,
  totalMaxYear: number
): { rangeStart: number; rangeEnd: number } {
  const range = currentEnd - currentStart;

  let rangeStart = currentStart + deltaYears;
  let rangeEnd = currentEnd + deltaYears;

  // Clamp to bounds
  if (rangeStart < totalMinYear) {
    rangeStart = totalMinYear;
    rangeEnd = totalMinYear + range;
  }
  if (rangeEnd > totalMaxYear) {
    rangeEnd = totalMaxYear;
    rangeStart = totalMaxYear - range;
  }

  return { rangeStart, rangeEnd };
}

/**
 * Zoom the minimap around a focal point (in years)
 */
export function zoomMinimapRange(
  currentStart: number,
  currentEnd: number,
  focalYear: number,
  zoomFactor: number, // > 1 = zoom in, < 1 = zoom out
  totalMinYear: number,
  totalMaxYear: number
): { rangeStart: number; rangeEnd: number } {
  const { minYearsVisible } = MINIMAP_CONFIG;
  const totalYears = totalMaxYear - totalMinYear;

  const currentRange = currentEnd - currentStart;
  let newRange = currentRange / zoomFactor;

  // Clamp range
  newRange = Math.max(minYearsVisible, Math.min(totalYears, newRange));

  // Keep focal point at same relative position
  const focalRatio = (focalYear - currentStart) / currentRange;
  let rangeStart = focalYear - focalRatio * newRange;
  let rangeEnd = rangeStart + newRange;

  // Clamp to bounds
  if (rangeStart < totalMinYear) {
    rangeStart = totalMinYear;
    rangeEnd = totalMinYear + newRange;
  }
  if (rangeEnd > totalMaxYear) {
    rangeEnd = totalMaxYear;
    rangeStart = totalMaxYear - newRange;
  }

  return { rangeStart, rangeEnd };
}

/**
 * Calculate the minimum meaningful range based on data density
 * (prevents zooming in beyond the granularity of the data)
 */
export function calculateMinimumMeaningfulRange(
  eventYears: number[]
): number {
  const { minYearsVisible } = MINIMAP_CONFIG;

  if (eventYears.length < 2) return minYearsVisible;

  // Sort years
  const sorted = [...eventYears].sort((a, b) => a - b);

  // Find minimum gap between consecutive events
  let minGap = Infinity;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > 0 && gap < minGap) {
      minGap = gap;
    }
  }

  // Minimap should show at least 10x the minimum gap
  // This ensures events are visually distinguishable
  const minMeaningfulRange = minGap === Infinity ? minYearsVisible : minGap * 10;

  return Math.max(minYearsVisible, minMeaningfulRange);
}

/**
 * Determine if the minimap should auto-adjust its range based on viewport indicator size
 */
export function shouldAutoAdjustRange(
  viewportIndicatorWidthPercent: number
): 'zoom-in' | 'zoom-out' | null {
  const { minViewportPercent, maxViewportPercent } = MINIMAP_CONFIG;

  if (viewportIndicatorWidthPercent < minViewportPercent) {
    return 'zoom-in';
  }
  if (viewportIndicatorWidthPercent > maxViewportPercent) {
    return 'zoom-out';
  }
  return null;
}
