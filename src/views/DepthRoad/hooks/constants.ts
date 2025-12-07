/**
 * DepthRoad View Configuration
 *
 * A 3D perspective timeline where time is represented as a road
 * receding into the distance toward a vanishing point.
 *
 * Direction: Bottom (near) = Present, Top (far) = Past
 */

export const DEPTH_ROAD_CONFIG = {
  // Road dimensions
  roadWidthNear: 400,      // Width of road at bottom (closest)
  roadWidthFar: 40,        // Width of road at vanishing point
  roadHeight: 800,         // Total visual height of the road
  vanishingPointY: 100,    // Y position of vanishing point from top

  // Perspective
  minPerspective: 400,     // Minimum perspective distance (zoomed in)
  maxPerspective: 1200,    // Maximum perspective distance (zoomed out)
  defaultPerspective: 800, // Starting perspective distance

  // Camera controls
  minTilt: -15,            // Minimum camera tilt (degrees)
  maxTilt: 15,             // Maximum camera tilt (degrees)
  defaultTilt: 0,          // Starting camera tilt

  // Event cards
  cardWidth: 180,
  cardHeight: 80,
  cardMinScale: 0.3,       // Scale of cards at far distance
  cardMaxScale: 1.0,       // Scale of cards at near distance

  // Time ticks
  majorTickInterval: 10,   // Years between major ticks (decades)
  minorTickInterval: 5,    // Years between minor ticks

  // Depth mapping (controls foreshortening curve)
  // Higher = more compression of distant past
  depthCurvePower: 0.7,

  // Layout
  eventLateralSpread: 0.4, // How much events can spread left/right (0-0.5)

  // Animation
  hoverTransitionMs: 200,
  cameraTransitionMs: 300,
} as const;

// Category colors for lateral grouping
export const CATEGORY_COLORS: Record<string, string> = {
  'Hardware': 'var(--color-text-accent)',
  'Algorithm': '#a78bfa',
  'Theory': '#f472b6',
  'Software': '#34d399',
  'default': 'var(--color-text-secondary)',
};
