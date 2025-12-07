/**
 * BikeRide View Configuration
 *
 * Controls path generation, visual styling, and interaction behavior
 * for the bike ride timeline visualization.
 */

export const BIKE_RIDE_CONFIG = {
  // Path generation
  pathAmplitude: 80, // Max vertical deviation from center (pixels)
  pathWavelength: 400, // Horizontal distance per wave cycle (pixels)
  pathSegments: 200, // Number of points to generate on path
  pathStrokeWidth: 12, // Width of the bike trail
  pathDashPattern: '20 10', // Dash pattern for path segments (optional styling)

  // Canvas sizing
  canvasHeight: 600, // Total viewport height
  pathCenterY: 300, // Y position of path center
  minCanvasWidth: 1200, // Minimum width of canvas
  pixelsPerYear: 30, // Default zoom level (pixels per year of time)

  // Zoom constraints
  zoomMin: 5, // Minimum pixels per year
  zoomMax: 200, // Maximum pixels per year
  zoomStep: 1.2, // Zoom multiplier per scroll step

  // Event stops
  stopRadius: 16, // Radius of event marker circles
  stopHoverRadius: 20, // Radius when hovered
  stopLabelOffset: 30, // Distance from path to label
  stopLabelMaxWidth: 180, // Max width of event labels

  // Bike playhead
  bikeWidth: 48, // Width of bike icon
  bikeHeight: 32, // Height of bike icon
  bikeAnimationDuration: 300, // Animation duration when scrubbing (ms)

  // MiniMap
  miniMapHeight: 60, // Height of minimap
  miniMapMargin: 16, // Margin around minimap
  viewportIndicatorMinWidth: 40, // Min width of viewport indicator

  // Time scrubber
  scrubberHeight: 40, // Height of scrubber bar
  scrubberTrackHeight: 4, // Height of scrubber track
  scrubberThumbSize: 16, // Size of scrubber thumb

  // Animation
  playbackSpeed: 1000, // Milliseconds per year during playback
  autoPlayInterval: 50, // Interval for auto-play animation frame

  // Decorations
  treeCount: 15, // Number of decorative trees along path
  benchCount: 5, // Number of decorative benches
  decorationOffset: 60, // Distance from path for decorations

  // Gap indicators
  gapThresholdYears: 50, // Show gap indicator for gaps >= this
  largeGapThresholdYears: 200, // Show large gap indicator for gaps >= this

  // Colors (reference theme tokens in CSS, these are for JS calculations)
  pathColorPrimary: 'var(--color-path-primary, #64748b)',
  pathColorSecondary: 'var(--color-path-secondary, #475569)',
};

/**
 * Path styling presets for different "eras" or phases
 */
export const PATH_STYLE_PRESETS = {
  default: {
    stroke: 'var(--color-bg-surface)',
    strokeWidth: BIKE_RIDE_CONFIG.pathStrokeWidth,
    fill: 'none',
  },
  highlight: {
    stroke: 'var(--color-text-accent)',
    strokeWidth: BIKE_RIDE_CONFIG.pathStrokeWidth + 2,
    fill: 'none',
  },
  muted: {
    stroke: 'var(--color-border)',
    strokeWidth: BIKE_RIDE_CONFIG.pathStrokeWidth - 2,
    fill: 'none',
    strokeDasharray: BIKE_RIDE_CONFIG.pathDashPattern,
  },
};

/**
 * Event type to visual style mapping
 */
export const EVENT_STYLE_MAP: Record<string, { color: string; icon: string }> = {
  default: { color: 'var(--color-text-accent)', icon: '●' },
  milestone: { color: 'var(--color-text-primary)', icon: '◆' },
  discovery: { color: '#22c55e', icon: '✦' },
  invention: { color: '#f59e0b', icon: '⚙' },
  event: { color: '#8b5cf6', icon: '○' },
};
