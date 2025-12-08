/**
 * Main hook for the River Path timeline view.
 *
 * Orchestrates path generation, event positioning, and interaction state.
 */

import { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { parseISOExtended } from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';
import { RIVER_PATH_CONFIG } from './constants';
import {
  generateRiverWaypoints,
  waypointsToBezierSegments,
  buildArcLengthLookup,
  getPositionAtArcLength,
  segmentsToSVGPath,
  calculateDensityProfile,
  getWidthAtPosition,
  offsetFromPath,
  type Point,
  type PathSegment,
  type ArcLengthLookup,
} from '../utils/pathUtils';

export interface RiverEvent extends TimelineEvent {
  position: Point;          // Position on the river bank
  riverPosition: Point;     // Position on the river centerline
  tangentAngle: number;     // Angle of river at this point
  normalizedTime: number;   // 0 = oldest, 1 = newest
  side: 'left' | 'right';   // Which bank the marker is on
  riverWidth: number;       // Width of river at this position
}

export interface RiverPathData {
  svgPath: string;
  segments: PathSegment[];
  arcLengthLookup: ArcLengthLookup;
  densityProfile: number[];
  widthSamples: Array<{ point: Point; width: number; angle: number }>;
}

export interface TimeRange {
  minYear: number;
  maxYear: number;
  span: number;
}

export interface UseRiverPathResult {
  // Data
  data: ReturnType<typeof useTimeline>['data'];
  events: RiverEvent[];
  riverPath: RiverPathData | null;
  timeRange: TimeRange;

  // Dimensions
  canvasWidth: number;
  canvasHeight: number;
  scaledWidth: number;
  scaledHeight: number;

  // State
  zoom: number;
  hoveredEventId: string | null;

  // Handlers
  handleZoomChange: (zoom: number) => void;
  handleEventHover: (id: string | null) => void;
  selectEvent: (id: string | null) => void;

  // Config
  config: typeof RIVER_PATH_CONFIG;
}

const VIEWPORT_PADDING = 50;

export const useRiverPath = (): UseRiverPathResult => {
  const { data, selectEvent } = useTimeline();
  const [zoom, setZoom] = useState<number>(RIVER_PATH_CONFIG.zoomDefault);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const hasAutoFitRef = useRef(false);

  // Calculate the time range from events
  const timeRange = useMemo(() => {
    if (!data || data.events.length === 0) {
      return { minYear: 0, maxYear: 0, span: 0 };
    }

    const years = data.events.map((e) => parseISOExtended(e.date_start).decimalYear);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      minYear,
      maxYear,
      span: maxYear - minYear || 1,
    };
  }, [data]);

  // Generate the river path geometry
  const riverPath = useMemo((): RiverPathData | null => {
    if (!data || data.events.length === 0) return null;

    const { canvasWidth, canvasHeight, bendCount, bendAmplitude, marginX, marginY } =
      RIVER_PATH_CONFIG;

    // Generate waypoints
    const waypoints = generateRiverWaypoints(
      canvasWidth,
      canvasHeight,
      bendCount,
      bendAmplitude,
      marginX,
      marginY
    );

    // Convert to Bezier segments
    const segments = waypointsToBezierSegments(waypoints);

    // Build arc-length lookup table
    const arcLengthLookup = buildArcLengthLookup(segments, 50);

    // Calculate density profile
    const eventTimes = data.events.map((e) => {
      const year = parseISOExtended(e.date_start).decimalYear;
      return (year - timeRange.minYear) / timeRange.span;
    });
    const densityProfile = calculateDensityProfile(eventTimes, 100, 0.05);

    // Generate width samples for rendering the river body
    const widthSamples: RiverPathData['widthSamples'] = [];
    const sampleCount = 100;

    for (let i = 0; i <= sampleCount; i++) {
      const t = i / sampleCount;
      const arcLength = t * arcLengthLookup.totalLength;
      const { point, tangentAngle } = getPositionAtArcLength(arcLengthLookup, arcLength);
      const width = getWidthAtPosition(
        t,
        densityProfile,
        RIVER_PATH_CONFIG.riverMinWidth,
        RIVER_PATH_CONFIG.riverMaxWidth
      );

      widthSamples.push({ point, width, angle: tangentAngle });
    }

    const svgPath = segmentsToSVGPath(segments);

    return {
      svgPath,
      segments,
      arcLengthLookup,
      densityProfile,
      widthSamples,
    };
  }, [data, timeRange]);

  // Position events along the river
  const events = useMemo((): RiverEvent[] => {
    if (!data || !riverPath) return [];

    // Sort events chronologically
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start).decimalYear;
      const dateB = parseISOExtended(b.date_start).decimalYear;
      return dateA - dateB;
    });

    return sortedEvents.map((event, index) => {
      const year = parseISOExtended(event.date_start).decimalYear;
      const normalizedTime = (year - timeRange.minYear) / timeRange.span;

      // Map time to arc length
      const arcLength = normalizedTime * riverPath.arcLengthLookup.totalLength;
      const { point: riverPosition, tangentAngle } = getPositionAtArcLength(
        riverPath.arcLengthLookup,
        arcLength
      );

      // Get river width at this position
      const riverWidth = getWidthAtPosition(
        normalizedTime,
        riverPath.densityProfile,
        RIVER_PATH_CONFIG.riverMinWidth,
        RIVER_PATH_CONFIG.riverMaxWidth
      );

      // Alternate sides for visual balance
      const side: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right';

      // Offset from river to place marker on bank
      const markerOffset = riverWidth / 2 + RIVER_PATH_CONFIG.markerOffset;
      const position = offsetFromPath(riverPosition, tangentAngle, markerOffset, side);

      return {
        ...event,
        position,
        riverPosition,
        tangentAngle,
        normalizedTime,
        side,
        riverWidth,
      };
    });
  }, [data, riverPath, timeRange]);

  // Auto-fit zoom on initial load - runs once when riverPath becomes available
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && riverPath) {
      hasAutoFitRef.current = true;
      const viewportWidth = window.innerWidth - VIEWPORT_PADDING * 2;
      const autoZoom = Math.max(
        RIVER_PATH_CONFIG.zoomMin,
        Math.min(RIVER_PATH_CONFIG.zoomMax, viewportWidth / RIVER_PATH_CONFIG.canvasWidth)
      );
      setZoom(autoZoom); // eslint-disable-line react-hooks/set-state-in-effect -- Initial auto-fit is a valid use case
    }
  }, [riverPath]);

  const handleZoomChange = useCallback((value: number) => {
    setZoom(
      Math.max(RIVER_PATH_CONFIG.zoomMin, Math.min(RIVER_PATH_CONFIG.zoomMax, value))
    );
  }, []);

  const handleEventHover = useCallback((id: string | null) => {
    setHoveredEventId(id);
  }, []);

  const scaledWidth = RIVER_PATH_CONFIG.canvasWidth * zoom;
  const scaledHeight = RIVER_PATH_CONFIG.canvasHeight * zoom;

  return {
    data,
    events,
    riverPath,
    timeRange,
    canvasWidth: RIVER_PATH_CONFIG.canvasWidth,
    canvasHeight: RIVER_PATH_CONFIG.canvasHeight,
    scaledWidth,
    scaledHeight,
    zoom,
    hoveredEventId,
    handleZoomChange,
    handleEventHover,
    selectEvent,
    config: RIVER_PATH_CONFIG,
  };
};
