/**
 * Configuration for the Exhibit Walk view.
 *
 * The Exhibit Walk presents timeline data as a museum corridor experience,
 * where users "walk" through chronologically ordered exhibit bays.
 */

export const EXHIBIT_WALK_CONFIG = {
  // Bay partitioning
  gapThresholdYears: 15, // Minimum gap to create a new bay
  maxEventsPerBay: 8, // Force new bay after this many events

  // Layout dimensions
  bayMinWidth: 280, // Minimum bay width in pixels
  bayMaxWidth: 600, // Maximum bay width in pixels
  bayWidthPerEvent: 80, // Additional width per event
  bayGap: 40, // Gap between bays (base)
  bayGapPerYear: 2, // Additional gap per year of temporal distance

  // Event card dimensions
  cardWidth: 240,
  cardHeight: 140,
  cardGap: 12,

  // Corridor styling
  corridorPadding: 60,
  corridorHeight: 600,

  // Navigation
  navThumbnailWidth: 40,
  navThumbnailGap: 8,
} as const;

export type ExhibitBaySize = 'compact' | 'standard' | 'expanded';

/**
 * Visual theme variants for exhibit bays.
 * Different categories can have different frame styles.
 */
export const BAY_THEMES = {
  default: {
    frameColor: 'var(--color-border)',
    accentColor: 'var(--color-text-accent)',
  },
  discovery: {
    frameColor: '#4a5568',
    accentColor: '#48bb78', // Green for discoveries
  },
  innovation: {
    frameColor: '#4a5568',
    accentColor: '#ed8936', // Orange for innovations
  },
  milestone: {
    frameColor: '#4a5568',
    accentColor: '#9f7aea', // Purple for milestones
  },
} as const;
