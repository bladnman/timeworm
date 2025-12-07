/**
 * Library Shelf View Configuration
 *
 * This view represents time as a shelf of books, where each book
 * is a time segment and events are chapters within that book.
 */

export const LIBRARY_SHELF_CONFIG = {
  // Book spine dimensions
  minSpineWidth: 40,        // Minimum width for a book spine in pixels
  maxSpineWidth: 120,       // Maximum width based on event count
  spineHeight: 320,         // Height of book spines
  spineGap: 4,              // Gap between book spines

  // Shelf styling
  shelfHeight: 24,          // Height of the shelf ledge
  shelfPadding: 32,         // Horizontal padding at shelf ends

  // Book grouping
  defaultSegmentYears: 10,  // Default time span per book (decade)
  minEventsPerBook: 1,      // Minimum events to create a book
  maxEventsPerBook: 50,     // Split books if they exceed this

  // Event density thresholds
  sparseThreshold: 3,       // <= 3 events = sparse
  denseThreshold: 10,       // >= 10 events = dense

  // Zoom levels
  zoomMin: 0.5,
  zoomMax: 2,
  zoomStep: 0.1,

  // Gap detection
  gapThresholdYears: 50,    // Show gap indicator if > 50 years between books

  // Animation
  openTransitionMs: 300,

  // Detail view
  chapterHeight: 72,        // Height of each chapter/event in opened book
  detailMaxWidth: 480,      // Max width of detail panel
} as const;

/**
 * Book spine color palette - leather-inspired tones
 * Cycles through these colors for visual variety
 */
export const SPINE_COLORS = [
  { bg: '#8B4513', text: '#F5DEB3' },  // Saddle brown / Wheat
  { bg: '#2F4F4F', text: '#E0E0E0' },  // Dark slate / Light gray
  { bg: '#800020', text: '#FFD700' },  // Burgundy / Gold
  { bg: '#1B4D3E', text: '#C4A35A' },  // Brunswick green / Antique gold
  { bg: '#36454F', text: '#F8F8FF' },  // Charcoal / Ghost white
  { bg: '#4A3728', text: '#DAA520' },  // Dark brown / Goldenrod
  { bg: '#191970', text: '#FFFACD' },  // Midnight blue / Lemon chiffon
  { bg: '#3C1414', text: '#CD853F' },  // Dark sienna / Peru
] as const;

export type SpineColor = typeof SPINE_COLORS[number];
