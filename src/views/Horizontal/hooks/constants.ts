export const HORIZONTAL_VIEW_CONFIG = {
  // Zoom settings
  defaultPixelsPerYear: 50,
  zoomMin: 2,
  zoomMax: 500,
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

  // Clustering
  clusterThreshold: 4, // Events beyond this become a cluster
  stackOffset: 20, // Vertical offset between stacked cards

  // Animation
  transitionDuration: 300,
} as const;
