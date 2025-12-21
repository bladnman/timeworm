import { MINIMAP_CONFIG } from '../../../hooks/constants';

// Re-export for use by other minimap modules
export { MINIMAP_CONFIG };

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a decimal year for display based on the visible range.
 * Shows appropriate granularity: years, months, or days.
 * Always includes year to avoid ambiguity.
 */
export function formatRangeLabel(decimalYear: number, rangeSpan: number): string {
  const year = Math.floor(decimalYear);
  const yearFraction = decimalYear - year;

  // Showing > 2 years: just show year
  if (rangeSpan > 2) {
    return String(year);
  }

  // Calculate month and day from fraction
  const dayOfYear = yearFraction * 365;
  const month = Math.floor(dayOfYear / 30.44); // Average days per month
  const dayOfMonth = Math.max(1, Math.floor(dayOfYear - month * 30.44) + 1);
  const monthIndex = Math.min(11, Math.max(0, month));

  // Showing > 3 months: show "Mon 'YY"
  if (rangeSpan > 0.25) {
    return `${MONTH_NAMES[monthIndex]} '${String(year).slice(-2)}`;
  }

  // Showing weeks or days: show "Mon D, 'YY"
  return `${MONTH_NAMES[monthIndex]} ${dayOfMonth}, '${String(year).slice(-2)}`;
}

/**
 * Frozen coordinate snapshot captured at drag start.
 * This allows the viewport indicator to remain stable during drag operations
 * even if the underlying state changes (e.g., auto-follow, zoom updates).
 */
export interface FrozenCoordinateSnapshot {
  // Captured at drag start - defines the "frozen" coordinate system
  viewportOffset: number;
  viewportWidth: number;
  pixelsPerYear: number;
  minimapRangeStart: number;
  minimapRangeEnd: number;
  minimapYearsVisible: number;
  totalMinYear: number;
  totalMaxYear: number;

  // Computed indicator position at drag start
  indicatorLeftPercent: number;
  indicatorWidthPercent: number;

  // Track dimensions for pixel-to-percent conversion
  trackWidth: number;
}

/**
 * Create a frozen coordinate snapshot from current state.
 * Call this at drag start to freeze the coordinate system.
 */
export function createCoordinateSnapshot(params: {
  viewportOffset: number;
  viewportWidth: number;
  pixelsPerYear: number;
  minimapRangeStart: number;
  minimapRangeEnd: number;
  totalMinYear: number;
  totalMaxYear: number;
  indicatorLeftPercent: number;
  indicatorWidthPercent: number;
  trackWidth: number;
}): FrozenCoordinateSnapshot {
  return {
    viewportOffset: params.viewportOffset,
    viewportWidth: params.viewportWidth,
    pixelsPerYear: params.pixelsPerYear,
    minimapRangeStart: params.minimapRangeStart,
    minimapRangeEnd: params.minimapRangeEnd,
    minimapYearsVisible: params.minimapRangeEnd - params.minimapRangeStart,
    totalMinYear: params.totalMinYear,
    totalMaxYear: params.totalMaxYear,
    indicatorLeftPercent: params.indicatorLeftPercent,
    indicatorWidthPercent: params.indicatorWidthPercent,
    trackWidth: params.trackWidth,
  };
}

/**
 * Convert a pixel delta to a percentage delta using the frozen snapshot.
 * This ensures consistent drag behavior regardless of live state changes.
 */
export function pixelDeltaToPercent(deltaPixels: number, snapshot: FrozenCoordinateSnapshot): number {
  if (snapshot.trackWidth <= 0) return 0;
  return (deltaPixels / snapshot.trackWidth) * 100;
}

/**
 * Convert a percentage position (in frozen coordinates) to a year.
 */
export function snapshotPercentToYear(percent: number, snapshot: FrozenCoordinateSnapshot): number {
  return minimapPercentToYear(percent, snapshot.minimapRangeStart, snapshot.minimapRangeEnd);
}

/**
 * Convert a year to a viewport offset using CURRENT (live) coordinates.
 * Used when committing the drag to reconcile frozen position with live state.
 */
export function yearToViewportOffset(
  centerYear: number,
  viewportWidth: number,
  pixelsPerYear: number,
  totalMinYear: number,
  totalWidth: number
): number {
  const viewportYears = viewportWidth / pixelsPerYear;
  const targetOffset = (centerYear - viewportYears / 2 - totalMinYear) * pixelsPerYear;
  // Clamp to valid range
  return Math.max(0, Math.min(totalWidth - viewportWidth, targetOffset));
}

/**
 * Calculate the center year from a preview position in frozen coordinates.
 */
export function getPreviewCenterYear(
  previewLeftPercent: number,
  previewWidthPercent: number,
  snapshot: FrozenCoordinateSnapshot
): number {
  const centerPercent = previewLeftPercent + previewWidthPercent / 2;
  return snapshotPercentToYear(centerPercent, snapshot);
}

/**
 * Calculate event density dots for the context (overview) bar.
 * Returns an array of dots with their percentage position and relative density.
 */
export function getEventDensityDots(
  items: Array<{ xPos: number }>,
  pixelsPerYear: number,
  totalMinYear: number,
  totalMaxYear: number,
  bucketCount: number = 30
): Array<{ percent: number; density: number }> {
  const totalYears = totalMaxYear - totalMinYear;
  if (totalYears <= 0 || items.length === 0) return [];

  // Create buckets
  const buckets = new Array(bucketCount).fill(0);

  // Count items in each bucket
  items.forEach((item) => {
    const year = item.xPos / pixelsPerYear + totalMinYear;
    const normalizedPosition = (year - totalMinYear) / totalYears;
    const bucketIndex = Math.floor(normalizedPosition * bucketCount);
    if (bucketIndex >= 0 && bucketIndex < bucketCount) {
      buckets[bucketIndex]++;
    }
  });

  // Find max count for normalization
  const maxCount = Math.max(...buckets);
  if (maxCount === 0) return [];

  // Convert to dots, filtering out empty buckets
  return buckets
    .map((count, i) => ({
      percent: ((i + 0.5) / bucketCount) * 100,
      density: count / maxCount,
    }))
    .filter((d) => d.density > 0);
}

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
  const visibleLeftPercent = Math.max(0, leftPercent);
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
