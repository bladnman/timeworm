/**
 * Configuration constants for the Strata (geological layers) timeline view.
 */

export const STRATA_VIEW_CONFIG = {
  // Container settings
  containerMaxWidth: 900,
  containerPadding: 48,
  bottomPadding: 120, // Space for view switcher

  // Layer height constraints
  minLayerHeight: 60, // Minimum height for any layer (ensures visibility)
  maxLayerHeight: 400, // Maximum height to prevent one layer dominating
  baseHeightPerYear: 2, // Base scaling factor: 2px per year

  // Event marker settings
  eventMarkerSize: 12,
  eventCardMinWidth: 200,
  eventCardMaxWidth: 320,
  eventGap: 8,

  // Age ruler settings
  rulerWidth: 60,
  rulerGap: 16,

  // Visual settings
  layerGap: 2, // Gap between layers
  labelBandWidth: 80, // Width of time label band

  // Layer coloring (subtle hue shifts for visual distinction)
  baseHue: 210, // Blue-ish base
  hueVariation: 15, // Slight variation between layers
  baseSaturation: 25,
  baseLightness: 18,
} as const;

/**
 * Granularity levels for layer segmentation.
 * Chosen automatically based on total time span.
 */
export type LayerGranularity = 'year' | 'decade' | 'quarter-century' | 'century' | 'millennium';

/**
 * Thresholds for selecting granularity based on total years.
 */
export const GRANULARITY_THRESHOLDS = {
  year: 15, // Use years if span < 15 years
  decade: 150, // Use decades if span < 150 years
  quarterCentury: 500, // Use 25-year periods if span < 500 years
  century: 2000, // Use centuries if span < 2000 years
  // Above 2000 years: use millennia
} as const;

/**
 * Get the interval size in years for each granularity level.
 */
export const GRANULARITY_INTERVAL: Record<LayerGranularity, number> = {
  year: 1,
  decade: 10,
  'quarter-century': 25,
  century: 100,
  millennium: 1000,
} as const;
