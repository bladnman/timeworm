export const MINIMAP_CONFIG = {
  // Target viewport indicator size as percentage of minimap width
  targetViewportPercent: 25,

  // Acceptable range before auto-adjustment
  minViewportPercent: 15,
  maxViewportPercent: 60,

  // Minimum years the minimap can display (fraction of a month allows day-level zoom)
  minYearsVisible: 1 / 52, // ~1 week minimum - allows zooming to day level

  // Auto-scroll settings during edge resize
  autoScrollStepPercent: 20,
  autoScrollIntervalMs: 50,

  // Edge detection threshold (percentage from edge)
  edgeThresholdPercent: 2,
} as const;

export const HORIZONTAL_VIEW_CONFIG = {
  // Zoom settings
  defaultPixelsPerYear: 50,
  zoomMin: 2,
  zoomMax: 100000, // Allows zooming to day-level (~365px per day at max)
  zoomStep: 2,

  // Card dimensions
  cardWidth: 240,
  cardHeight: 180, // Taller to accommodate images
  cardHeightCompact: 80, // For stacked cards without images
  gap: 48,

  // Track layout
  trackHeight: 4,
  connectorLength: 60,
  anchorSize: 10,

  // Clustering - more generous to show individual items when possible
  clusterThreshold: 8, // Events beyond this become a cluster
  stackOffset: 20, // Vertical offset between stacked cards
  stackCapacity: 6, // Max items per stack before clustering

  // Animation
  transitionDuration: 300,
} as const;
