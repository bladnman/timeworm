export const TRAIN_JOURNEY_CONFIG = {
  // Track dimensions
  trackHeight: 8,
  sleeperWidth: 6,
  sleeperGap: 16,

  // Station sizing
  stationWidthMajor: 100,
  stationWidthMinor: 60,
  stationHeight: 50,
  platformHeight: 10,

  // Event cards
  eventCardWidth: 220,
  eventCardHeight: 70,
  eventCardGap: 12,
  eventConnectorLength: 50,

  // Layout
  trackY: 250,               // Vertical center of track
  eventZoneHeight: 200,      // Space above/below for events
  stationLabelOffset: 24,    // Label below platform

  // Zoom
  defaultPixelsPerYear: 40,
  zoomMin: 2,
  zoomMax: 300,
  zoomStep: 2,

  // Clustering
  minEventSpacing: 60,       // Minimum px between events
  clusterThreshold: 4,       // Events before summarizing
} as const;

export const GRANULARITY_THRESHOLDS = {
  centuries: 500,    // If span > 500 years, use centuries
  decades: 50,       // If span > 50 years, use decades
  years: 5,          // If span > 5 years, use years
  months: 1,         // If span > 1 year, use months
} as const;

export type StationType = 'terminus' | 'major' | 'minor';

export interface Station {
  id: string;
  year: number;
  label: string;
  type: StationType;
  xPos: number;
}

export interface TrackSegment {
  startX: number;
  endX: number;
  startYear: number;
  endYear: number;
}

export interface EventWithPosition {
  id: string;
  title: string;
  date_display: string;
  date_start: string;
  type: string;
  xPos: number;
  lane: 'above' | 'below';
  stackIndex: number;
  stationId: string | null;  // null if between stations
  innovator: string;
}

export interface EventCluster {
  id: string;
  events: EventWithPosition[];
  xPos: number;
  startYear: number;
  endYear: number;
  lane: 'above' | 'below';
}
