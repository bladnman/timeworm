/**
 * Configuration for the Orbital Rings timeline view.
 *
 * Ring Layout:
 * - Outer rings represent older time periods
 * - Inner rings represent newer time periods
 * - Events are placed on ring circumferences at angles derived from their timestamps
 */

export const ORBITAL_VIEW_CONFIG = {
  /** Pixels between each ring */
  ringSpacing: 50,

  /** Minimum radius from center for innermost ring */
  minRadius: 80,

  /** Maximum radius from center for outermost ring */
  maxRadius: 380,

  /** Stroke width for ring lines */
  ringStrokeWidth: 1,

  /** Radius of event nodes on rings */
  nodeRadius: 8,

  /** Radius of event nodes when hovered */
  nodeRadiusHover: 12,

  /** Default number of years per ring segment */
  defaultYearsPerRing: 10,

  /** Minimum years per ring (when zoomed in) */
  minYearsPerRing: 1,

  /** Maximum years per ring (when zoomed out) */
  maxYearsPerRing: 100,

  /** Animation duration in ms */
  animationDuration: 300,

  /** Opacity of ring lines */
  ringOpacity: 0.3,

  /** Opacity of ring lines when focused */
  ringOpacityFocused: 0.6,

  /** Center node radius (the "star" in the middle) */
  centerRadius: 12,

  /** Show chronological path indicator */
  showChronologicalPath: true,

  /** Path stroke width */
  pathStrokeWidth: 2,

  /** Label offset from ring (in pixels) */
  labelOffset: 16,
} as const;

/**
 * Color palette for event type categories.
 * Maps event types to accent colors.
 */
export const EVENT_TYPE_COLORS: Record<string, string> = {
  Hardware: '#f472b6',    // Pink
  Software: '#38bdf8',    // Sky blue
  Concept: '#a78bfa',     // Purple
  Network: '#34d399',     // Emerald
  Interface: '#fb923c',   // Orange
  AI: '#facc15',          // Yellow
  default: '#94a3b8',     // Slate (fallback)
};
