/**
 * Configuration constants for the River Path timeline view.
 *
 * The river flows from left (past) to right (present), curving gently
 * to create an organic, journey-like feel while maintaining temporal integrity.
 */

export const RIVER_PATH_CONFIG = {
  // Canvas dimensions
  canvasWidth: 4000,          // Total scrollable width
  canvasHeight: 800,          // Viewport height

  // River geometry
  riverBaseWidth: 60,         // Base width of the river (without density scaling)
  riverMaxWidth: 120,         // Maximum width when event density is high
  riverMinWidth: 30,          // Minimum width when event density is low

  // Path generation
  bendCount: 12,              // Number of gentle bends in the river
  bendAmplitude: 100,         // Maximum vertical deviation from center
  marginX: 150,               // Horizontal margin at start/end
  marginY: 150,               // Minimum distance from top/bottom edges

  // Event markers
  markerRadius: 12,           // Base size of event markers
  markerLargeRadius: 18,      // Size for important events
  markerOffset: 50,           // Distance from river center to marker

  // Interaction
  zoomMin: 0.3,
  zoomMax: 3,
  zoomDefault: 1,
  zoomStep: 0.1,

  // Level of Detail thresholds
  lodClusterThreshold: 30,    // Pixel distance to start clustering
  lodMinZoomForLabels: 0.5,   // Minimum zoom to show labels

  // Animation
  transitionDuration: 300,

  // Colors (using CSS variables from theme)
  riverGradient: {
    upstream: 'rgba(56, 189, 248, 0.15)',   // Light at source
    midstream: 'rgba(56, 189, 248, 0.35)',  // Richer in middle
    downstream: 'rgba(56, 189, 248, 0.5)',  // Full at present
  },
  riverStroke: 'rgba(56, 189, 248, 0.6)',
  riverStrokeWidth: 2,

  // Density calculation
  densityWindowYears: 10,     // Time window for density calculation
} as const;

export type RiverPathConfig = typeof RIVER_PATH_CONFIG;
