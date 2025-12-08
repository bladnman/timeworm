import { useMemo, useState, useCallback } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { parseISOExtended, type ParsedDate } from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';
import { ORBITAL_VIEW_CONFIG, EVENT_TYPE_COLORS } from './constants';

/**
 * Represents a single ring in the orbital visualization.
 * Each ring covers a contiguous time segment.
 */
export interface Ring {
  /** Ring index: 0 = outermost (oldest) */
  index: number;
  /** Start year of this ring's time segment */
  startYear: number;
  /** End year of this ring's time segment (exclusive) */
  endYear: number;
  /** Human-readable label for the ring */
  label: string;
  /** Pixel radius from center */
  radius: number;
  /** Whether this ring has equal duration to others */
  isUniformDuration: boolean;
}

/**
 * An event positioned on an orbital ring.
 */
export interface OrbitalEvent {
  /** Original event data */
  event: TimelineEvent;
  /** Which ring this event belongs to */
  ringIndex: number;
  /** Angle in degrees (0 = top, clockwise) */
  angle: number;
  /** SVG x position relative to center */
  x: number;
  /** SVG y position relative to center */
  y: number;
  /** Color based on event type */
  color: string;
  /** Parsed date for calculations */
  parsedDate: ParsedDate;
}

/**
 * Chronological path segment connecting events in reading order.
 */
export interface PathSegment {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  ringTransition: boolean;
}

/**
 * Convert angle (degrees) and radius to SVG coordinates.
 * 0° = top (12 o'clock), proceeding clockwise.
 */
const polarToCartesian = (
  angleDegrees: number,
  radius: number,
  centerX: number,
  centerY: number
): { x: number; y: number } => {
  // Convert to radians, offset by -90° so 0° is at top
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians),
  };
};

/**
 * Get color for an event (default color since type was removed).
 */
const getEventColor = (): string => {
  return EVENT_TYPE_COLORS.default;
};

/**
 * Hook for the Orbital Rings timeline view.
 * Partitions events into concentric rings by time period.
 */
export const useOrbitalRingsView = () => {
  const { data, selectEvent } = useTimeline();

  // Years per ring (zoom control)
  const [yearsPerRing, setYearsPerRing] = useState<number>(ORBITAL_VIEW_CONFIG.defaultYearsPerRing);

  // Currently focused ring (null = show all)
  const [focusedRingIndex, setFocusedRingIndex] = useState<number | null>(null);

  // Currently hovered event
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  // Parse and sort all events chronologically
  const sortedEvents = useMemo(() => {
    if (!data?.events) return [];

    return [...data.events]
      .map((event) => ({
        event,
        parsedDate: parseISOExtended(event.date_start),
      }))
      .sort((a, b) => a.parsedDate.decimalYear - b.parsedDate.decimalYear);
  }, [data?.events]);

  // Determine time bounds
  const timeBounds = useMemo(() => {
    if (sortedEvents.length === 0) {
      return { minYear: 0, maxYear: 0, totalYears: 0 };
    }

    const minYear = sortedEvents[0].parsedDate.year;
    const maxYear = sortedEvents[sortedEvents.length - 1].parsedDate.year;

    return {
      minYear,
      maxYear,
      totalYears: maxYear - minYear + 1,
    };
  }, [sortedEvents]);

  // Generate rings based on time bounds and years per ring
  const rings = useMemo((): Ring[] => {
    if (sortedEvents.length === 0) return [];

    const { minYear, maxYear } = timeBounds;

    // Round start year down to nearest segment boundary
    const segmentStart = Math.floor(minYear / yearsPerRing) * yearsPerRing;
    // Round end year up to include all events
    const segmentEnd = Math.ceil((maxYear + 1) / yearsPerRing) * yearsPerRing;

    const ringCount = Math.ceil((segmentEnd - segmentStart) / yearsPerRing);
    const generatedRings: Ring[] = [];

    for (let i = 0; i < ringCount; i++) {
      const startYear = segmentStart + i * yearsPerRing;
      const endYear = startYear + yearsPerRing;

      // Calculate radius: outer = oldest, inner = newest
      // Invert index so oldest (i=0) is outermost
      const radiusIndex = ringCount - 1 - i;
      const radiusRange = ORBITAL_VIEW_CONFIG.maxRadius - ORBITAL_VIEW_CONFIG.minRadius;
      const radius =
        ORBITAL_VIEW_CONFIG.minRadius +
        (ringCount > 1 ? (radiusIndex / (ringCount - 1)) * radiusRange : radiusRange / 2);

      // Create label based on segment size
      let label: string;
      if (yearsPerRing === 1) {
        label = startYear.toString();
      } else if (yearsPerRing === 10) {
        label = `${startYear}s`;
      } else if (yearsPerRing === 100) {
        // Century
        const century = Math.floor(startYear / 100) + 1;
        label = startYear < 0 ? `${Math.abs(century)}th c. BCE` : `${century}th c.`;
      } else {
        label = `${startYear}-${endYear - 1}`;
      }

      generatedRings.push({
        index: i,
        startYear,
        endYear,
        label,
        radius,
        isUniformDuration: true, // All rings have same yearsPerRing
      });
    }

    return generatedRings;
  }, [sortedEvents.length, timeBounds, yearsPerRing]);

  // Calculate center point (will be set based on viewport)
  const center = useMemo(() => {
    const size = (ORBITAL_VIEW_CONFIG.maxRadius + 60) * 2;
    return { x: size / 2, y: size / 2, size };
  }, []);

  // Position events on their respective rings
  const orbitalEvents = useMemo((): OrbitalEvent[] => {
    if (rings.length === 0) return [];

    return sortedEvents.map(({ event, parsedDate }) => {
      // Find which ring this event belongs to
      const ringIndex = rings.findIndex(
        (ring) => parsedDate.year >= ring.startYear && parsedDate.year < ring.endYear
      );

      const ring = rings[ringIndex] || rings[rings.length - 1];

      // Calculate angle within the ring
      // Position = (time within segment / segment duration) * 360°
      const timeInSegment = parsedDate.decimalYear - ring.startYear;
      const segmentDuration = ring.endYear - ring.startYear;
      const angle = (timeInSegment / segmentDuration) * 360;

      // Convert to SVG coordinates
      const { x, y } = polarToCartesian(angle, ring.radius, center.x, center.y);

      return {
        event,
        ringIndex: ring.index,
        angle,
        x,
        y,
        color: getEventColor(),
        parsedDate,
      };
    });
  }, [sortedEvents, rings, center]);

  // Generate chronological path segments
  const chronologicalPath = useMemo((): PathSegment[] => {
    if (!ORBITAL_VIEW_CONFIG.showChronologicalPath || orbitalEvents.length < 2) {
      return [];
    }

    const segments: PathSegment[] = [];

    for (let i = 0; i < orbitalEvents.length - 1; i++) {
      const from = orbitalEvents[i];
      const to = orbitalEvents[i + 1];

      segments.push({
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        ringTransition: from.ringIndex !== to.ringIndex,
      });
    }

    return segments;
  }, [orbitalEvents]);

  // Get events for a specific ring (for focused view)
  const getEventsForRing = useCallback(
    (ringIndex: number): OrbitalEvent[] => {
      return orbitalEvents.filter((e) => e.ringIndex === ringIndex);
    },
    [orbitalEvents]
  );

  // Handlers
  const handleRingFocus = useCallback((ringIndex: number | null) => {
    setFocusedRingIndex(ringIndex);
  }, []);

  const handleEventHover = useCallback((eventId: string | null) => {
    setHoveredEventId(eventId);
  }, []);

  const handleEventClick = useCallback(
    (eventId: string) => {
      selectEvent(eventId);
    },
    [selectEvent]
  );

  const handleZoomChange = useCallback((value: number) => {
    setYearsPerRing(value);
  }, []);

  // Get hovered event details
  const hoveredEvent = useMemo(() => {
    if (!hoveredEventId) return null;
    return orbitalEvents.find((e) => e.event.id === hoveredEventId) || null;
  }, [hoveredEventId, orbitalEvents]);

  return {
    // Data
    data,
    rings,
    orbitalEvents,
    chronologicalPath,
    center,
    timeBounds,

    // State
    yearsPerRing,
    focusedRingIndex,
    hoveredEventId,
    hoveredEvent,

    // Handlers
    handleRingFocus,
    handleEventHover,
    handleEventClick,
    handleZoomChange,
    selectEvent,
    getEventsForRing,

    // Config
    config: ORBITAL_VIEW_CONFIG,
  };
};
