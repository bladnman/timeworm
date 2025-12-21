/**
 * Smart auto-fit zoom algorithm for timeline visualization.
 *
 * Calculates optimal zoom level and padding based on:
 * - Event count and density
 * - Data time span
 * - Viewport width
 * - Clustering thresholds
 */

export interface AutoFitConfig {
  /** Width of event cards in pixels */
  cardWidth: number;
  /** Gap between cards in pixels */
  gap: number;
  /** Max items that can stack before clustering (typically 3) */
  stackCapacity: number;
  /** Minimum zoom (pixels per year) */
  zoomMin: number;
  /** Maximum zoom (pixels per year) */
  zoomMax: number;
  /** Minimum edge padding in pixels */
  minEdgePadding: number;
}

export interface AutoFitResult {
  /** Calculated optimal pixels per year */
  pixelsPerYear: number;
  /** Padding before first event (in years) */
  paddingBefore: number;
  /** Padding after last event (in years) */
  paddingAfter: number;
  /** Total years to display (data span + padding) */
  displaySpan: number;
  /** Initial scroll offset (0 = start at beginning) */
  initialOffset: number;
  /** Ratio of events to viewport capacity (for debugging) */
  densityRatio: number;
}

/** Padding as a fraction of data span (10% each side) */
const PADDING_RATIO = 0.1;

/** Threshold above which we zoom into a portion instead of showing all */
const DENSITY_THRESHOLD = 1.5;

/** Minimum span to display (prevents division issues with single-point data) */
const MIN_DISPLAY_SPAN_YEARS = 1 / 365; // ~1 day minimum

/**
 * Compute the optimal zoom level and padding for auto-fit.
 *
 * For sparse data (few events relative to viewport capacity):
 *   - Shows entire data range with proportional padding
 *
 * For dense data (many events that would cluster):
 *   - Zooms into a portion to maximize individual item visibility
 *   - Starts at beginning of data, user scrolls forward
 */
export function computeAutoFitZoom(
  eventCount: number,
  dataSpanYears: number,
  viewportWidth: number,
  config: AutoFitConfig
): AutoFitResult {
  const { cardWidth, gap, stackCapacity, zoomMin, zoomMax, minEdgePadding } = config;

  // Minimum separation before items cluster
  const minSeparation = cardWidth + gap;

  // How many individual items can fit in viewport (with stacking)?
  const groupsInViewport = Math.floor(viewportWidth / minSeparation);
  const maxIndividualItems = Math.max(1, groupsInViewport * stackCapacity);

  // Density ratio: how many events vs. how many can display
  const densityRatio = eventCount / maxIndividualItems;

  // Ensure minimum span for single-event or same-date cases
  const effectiveSpan = Math.max(dataSpanYears, MIN_DISPLAY_SPAN_YEARS);

  let displaySpan: number;

  if (densityRatio <= DENSITY_THRESHOLD) {
    // LOW DENSITY: Show entire data range with proportional padding
    const padding = effectiveSpan * PADDING_RATIO;
    displaySpan = effectiveSpan + padding * 2;
  } else {
    // HIGH DENSITY: Zoom into a portion to show more individual items
    // Calculate portion that would give us ~maxIndividualItems events
    const portionSpan = effectiveSpan / densityRatio;
    const padding = portionSpan * PADDING_RATIO;
    displaySpan = portionSpan + padding * 2;
  }

  // Account for edge padding when calculating zoom
  const effectiveViewportWidth = Math.max(100, viewportWidth - minEdgePadding * 2);

  // Calculate proportional padding BEFORE clamping (always 10% of data span)
  const paddingBefore = effectiveSpan * PADDING_RATIO;
  const paddingAfter = effectiveSpan * PADDING_RATIO;

  // Calculate zoom to fit displaySpan in viewport
  let pixelsPerYear = effectiveViewportWidth / displaySpan;

  // Clamp to zoom bounds
  pixelsPerYear = Math.max(zoomMin, Math.min(zoomMax, pixelsPerYear));

  // Update displaySpan based on clamped zoom (for return value accuracy)
  // But DON'T change padding - padding should always be proportional to data span
  displaySpan = effectiveViewportWidth / pixelsPerYear;

  return {
    pixelsPerYear,
    paddingBefore,
    paddingAfter,
    displaySpan,
    initialOffset: 0, // Start at beginning of data
    densityRatio,
  };
}

/**
 * Calculate dynamic zoom max based on data granularity.
 *
 * zoomMax = (cardWidth + gap) / minimum_spacing_between_events
 *
 * No arbitrary limits - if closest events are 1ms apart, you can zoom
 * until that 1ms fills the viewport with proper card spacing.
 */
export function getDataAwareZoomMax(
  dataSpanYears: number,
  eventCount: number,
  cardWidth: number = 240,
  gap: number = 48,
  eventYears?: number[] // Optional: actual event positions for minimum spacing calc
): number {
  const targetPixelSpacing = cardWidth + gap;

  // Find minimum non-zero spacing between events
  let minSpacing = Infinity;

  if (eventYears && eventYears.length >= 2) {
    const sorted = [...eventYears].sort((a, b) => a - b);

    for (let i = 1; i < sorted.length; i++) {
      const spacing = sorted[i] - sorted[i - 1];
      if (spacing > 0 && spacing < minSpacing) {
        minSpacing = spacing;
      }
    }
  }

  // If no valid spacing found (single event or all same timestamp),
  // fall back to average spacing
  if (minSpacing === Infinity || minSpacing === 0) {
    if (eventCount < 2) {
      // Single event: allow zooming to show ~1 hour in viewport
      return targetPixelSpacing / (1 / 8760); // 1 hour in years
    }
    // All same timestamp: use average spacing as fallback
    minSpacing = dataSpanYears / (eventCount - 1);
    if (minSpacing <= 0) {
      // Truly all same time: allow zooming to 1 second granularity
      return targetPixelSpacing / (1 / 31536000); // 1 second in years
    }
  }

  // zoomMax = pixels needed to separate closest events by cardWidth + gap
  return targetPixelSpacing / minSpacing;
}
