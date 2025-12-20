/**
 * YouTube View Configuration
 *
 * Configuration constants for the YouTube visualization, based on HorizontalView
 * with YouTube-specific color scheme.
 */

export const YOUTUBE_COLORS = {
  primary: '#FF0000',        // YouTube red
  primaryDark: '#CC0000',    // Darker red for hover
  charcoal: '#282828',       // YouTube dark background
  charcoalLight: '#383838',  // Lighter charcoal for surfaces
  charcoalMuted: '#606060',  // Muted gray for secondary text
  white: '#FFFFFF',
} as const;

export const MINIMAP_CONFIG = {
  // Target viewport indicator size as percentage of minimap width
  targetViewportPercent: 25,

  // Acceptable range before auto-adjustment
  minViewportPercent: 15,
  maxViewportPercent: 60,

  // Minimum years the minimap can display (prevents over-zooming)
  minYearsVisible: 5,

  // Auto-scroll settings during edge resize
  autoScrollStepPercent: 20,
  autoScrollIntervalMs: 50,

  // Edge detection threshold (percentage from edge)
  edgeThresholdPercent: 2,
} as const;

export const YOUTUBE_VIEW_CONFIG = {
  // Zoom settings
  defaultPixelsPerYear: 50,
  zoomMin: 2,
  zoomMax: 500,
  zoomStep: 2,

  // Card dimensions (16:9 thumbnail optimized)
  cardWidth: 240,
  cardHeight: 180, // Taller to accommodate 16:9 thumbnails
  cardHeightCompact: 80, // For stacked cards without images
  gap: 48,

  // Track layout
  trackHeight: 4,
  connectorLength: 60,
  anchorSize: 10, // Will be play icon instead of circle

  // Clustering
  clusterThreshold: 4, // Videos beyond this become a cluster
  stackOffset: 20, // Vertical offset between stacked cards

  // Animation
  transitionDuration: 300,
} as const;
