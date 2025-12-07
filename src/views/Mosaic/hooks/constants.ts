/**
 * Mosaic Grid View Configuration
 *
 * The grid maps time to a 2D structure where both axes encode temporal information.
 * Bucket sizes adapt based on the total time range of the dataset.
 */

export const MOSAIC_VIEW_CONFIG = {
  /** Minimum cell size in pixels */
  minCellSize: 32,
  /** Maximum cell size in pixels */
  maxCellSize: 80,
  /** Default cell size in pixels */
  defaultCellSize: 48,
  /** Gap between cells in pixels */
  cellGap: 2,
  /** Padding around the grid in pixels */
  gridPadding: 24,
  /** Maximum events to show in tooltip before truncating */
  maxTooltipEvents: 5,
  /** Transition duration for hover effects */
  hoverTransitionMs: 150,
} as const;

/**
 * Time bucket types in order of granularity (finest to coarsest)
 */
export type BucketType = 'day' | 'month' | 'year' | 'decade' | 'century';

/**
 * Grid configuration for each bucket type.
 * Defines how time maps to X and Y axes.
 */
export interface BucketConfig {
  type: BucketType;
  /** Label for the X-axis */
  xAxisLabel: string;
  /** Number of columns (X-axis subdivisions) */
  xCount: number;
  /** Label for the Y-axis */
  yAxisLabel: string;
  /** Minimum time span in years for this bucket type */
  minYearsSpan: number;
  /** Maximum time span in years for this bucket type */
  maxYearsSpan: number;
}

/**
 * Bucket configurations ordered by time span (smallest to largest)
 */
export const BUCKET_CONFIGS: BucketConfig[] = [
  {
    type: 'day',
    xAxisLabel: 'Day of Month',
    xCount: 31,
    yAxisLabel: 'Month',
    minYearsSpan: 0,
    maxYearsSpan: 2,
  },
  {
    type: 'month',
    xAxisLabel: 'Month',
    xCount: 12,
    yAxisLabel: 'Year',
    minYearsSpan: 2,
    maxYearsSpan: 50,
  },
  {
    type: 'year',
    xAxisLabel: 'Year in Decade',
    xCount: 10,
    yAxisLabel: 'Decade',
    minYearsSpan: 50,
    maxYearsSpan: 500,
  },
  {
    type: 'decade',
    xAxisLabel: 'Decade in Century',
    xCount: 10,
    yAxisLabel: 'Century',
    minYearsSpan: 500,
    maxYearsSpan: 5000,
  },
  {
    type: 'century',
    xAxisLabel: 'Century in Millennium',
    xCount: 10,
    yAxisLabel: 'Millennium',
    minYearsSpan: 5000,
    maxYearsSpan: Infinity,
  },
];

/**
 * Color intensity scale for cell density visualization.
 * Uses opacity values (0-1) mapped to event counts.
 */
export const DENSITY_COLORS = {
  /** Base hue for the density gradient (cyan/teal) */
  hue: 186,
  /** Saturation percentage */
  saturation: 72,
  /** Lightness percentage for filled cells */
  lightness: 58,
  /** Minimum opacity for cells with 1 event */
  minOpacity: 0.3,
  /** Maximum opacity for cells with many events */
  maxOpacity: 1.0,
} as const;

/**
 * Zoom level presets for quick navigation
 */
export const ZOOM_PRESETS = [
  { label: 'Days', bucket: 'day' as BucketType },
  { label: 'Months', bucket: 'month' as BucketType },
  { label: 'Years', bucket: 'year' as BucketType },
  { label: 'Decades', bucket: 'decade' as BucketType },
  { label: 'Centuries', bucket: 'century' as BucketType },
] as const;
