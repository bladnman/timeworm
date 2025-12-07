export const TRAIL_PROFILE_CONFIG = {
  // Zoom settings
  defaultPixelsPerYear: 50,
  zoomMin: 2,
  zoomMax: 500,
  zoomStep: 2,

  // Trail dimensions
  trailHeight: 200,          // Max height of the elevation profile
  trailPadding: 60,          // Padding above/below the trail
  axisHeight: 40,            // Height reserved for time axis

  // Density calculation
  densityWindowYears: 10,    // Window size for density calculation
  sampleIntervalPixels: 4,   // Sample every N pixels for smooth curve

  // Event markers
  markerRadius: 8,
  markerRadiusHover: 12,

  // Colors (using CSS variables where possible, but defining trail-specific ones)
  trailGradientStart: 'rgba(56, 189, 248, 0.4)',  // Sky 400 with alpha
  trailGradientEnd: 'rgba(56, 189, 248, 0.05)',
  trailStroke: '#38bdf8',                          // Sky 400
  trailStrokeWidth: 3,
} as const;

export type MetricType = 'density' | 'importance';

export const METRIC_LABELS: Record<MetricType, { name: string; uphill: string; downhill: string }> = {
  density: {
    name: 'Event Density',
    uphill: 'More events',
    downhill: 'Fewer events',
  },
  importance: {
    name: 'Importance',
    uphill: 'Higher importance',
    downhill: 'Lower importance',
  },
};
