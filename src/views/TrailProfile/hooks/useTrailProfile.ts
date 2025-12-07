import { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale, type TimeScaleResult } from '../../../hooks/useTimeScale';
import { parseISOExtended } from '../../../utils/dateUtils';
import { TRAIL_PROFILE_CONFIG, type MetricType, METRIC_LABELS } from './constants';
import type { TimelineEvent } from '../../../types/timeline';

export interface TrailPoint {
  x: number;           // X position in pixels
  y: number;           // Y position (0 = top of trail area, trailHeight = bottom)
  value: number;       // Raw metric value (0-1 normalized)
  year: number;        // Approximate year at this point
}

export interface TrailEventMarker {
  event: TimelineEvent;
  x: number;           // X position on trail
  y: number;           // Y position on trail (on the curve)
  value: number;       // Metric value at this point
}

export interface Tick {
  year: number;
  label: string;
  major: boolean;
}

const VIEWPORT_PADDING = 100;

const computeAutoFitZoom = (totalYears: number): number => {
  const viewportWidth = window.innerWidth - VIEWPORT_PADDING * 2;
  return Math.max(
    TRAIL_PROFILE_CONFIG.zoomMin,
    Math.min(TRAIL_PROFILE_CONFIG.zoomMax, viewportWidth / totalYears)
  );
};

/**
 * Calculate event density at a given decimal year position
 */
const calculateDensityAtYear = (
  events: TimelineEvent[],
  targetYear: number,
  windowYears: number
): number => {
  const halfWindow = windowYears / 2;
  let count = 0;

  for (const event of events) {
    const eventDate = parseISOExtended(event.date_start);
    const yearDiff = Math.abs(eventDate.decimalYear - targetYear);

    if (yearDiff <= halfWindow) {
      // Weighted by distance (closer events count more)
      const weight = 1 - (yearDiff / halfWindow);
      count += weight;
    }
  }

  return count;
};

/**
 * Interpolate Y position on the trail curve at a given X
 */
const interpolateYAtX = (trailPoints: TrailPoint[], targetX: number): number => {
  if (trailPoints.length === 0) return 0;
  if (trailPoints.length === 1) return trailPoints[0].y;

  // Find the two points that bracket targetX
  for (let i = 0; i < trailPoints.length - 1; i++) {
    const p1 = trailPoints[i];
    const p2 = trailPoints[i + 1];

    if (targetX >= p1.x && targetX <= p2.x) {
      // Linear interpolation between the two points
      const t = (targetX - p1.x) / (p2.x - p1.x);
      return p1.y + t * (p2.y - p1.y);
    }
  }

  // If outside range, return nearest endpoint
  if (targetX < trailPoints[0].x) return trailPoints[0].y;
  return trailPoints[trailPoints.length - 1].y;
};

export const useTrailProfile = () => {
  const { data, selectEvent } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(TRAIL_PROFILE_CONFIG.defaultPixelsPerYear);
  const [metricType, setMetricType] = useState<MetricType>('density');
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const hasAutoFitRef = useRef(false);

  const timeScale: TimeScaleResult = useTimeScale(data, { pixelsPerYear });
  const { totalWidth, getPosition, minDate, totalYears, years } = timeScale;

  // Auto-fit zoom on initial load using useLayoutEffect for synchronous update before paint
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && data && totalYears > 0) {
      hasAutoFitRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
      setPixelsPerYear(computeAutoFitZoom(totalYears));
    }
  }, [data, totalYears]);

  // Generate trail points by sampling across the timeline
  const trailPoints = useMemo((): TrailPoint[] => {
    if (!data || data.events.length === 0 || totalWidth === 0) return [];

    const points: TrailPoint[] = [];
    const sampleInterval = TRAIL_PROFILE_CONFIG.sampleIntervalPixels;
    const windowYears = TRAIL_PROFILE_CONFIG.densityWindowYears;
    const trailHeight = TRAIL_PROFILE_CONFIG.trailHeight;

    // Calculate density at each sample point
    const densities: number[] = [];
    for (let x = 0; x <= totalWidth; x += sampleInterval) {
      const yearsFromStart = x / pixelsPerYear;
      const year = minDate.decimalYear + yearsFromStart;
      const density = calculateDensityAtYear(data.events, year, windowYears);
      densities.push(density);
    }

    // Normalize densities to 0-1 range
    const maxDensity = Math.max(...densities, 0.001); // Avoid division by zero

    // Generate points
    let i = 0;
    for (let x = 0; x <= totalWidth; x += sampleInterval) {
      const normalizedValue = densities[i] / maxDensity;
      // Invert Y so higher values go UP (lower Y value)
      const y = trailHeight - (normalizedValue * trailHeight * 0.9); // 0.9 to leave some padding at top
      const yearsFromStart = x / pixelsPerYear;
      const year = minDate.year + yearsFromStart;

      points.push({
        x,
        y: y + TRAIL_PROFILE_CONFIG.trailPadding,
        value: normalizedValue,
        year: Math.round(year),
      });
      i++;
    }

    return points;
  }, [data, totalWidth, pixelsPerYear, minDate]);

  // Position event markers on the trail
  const eventMarkers = useMemo((): TrailEventMarker[] => {
    if (!data || trailPoints.length === 0) return [];

    return data.events.map((event) => {
      const x = getPosition(event.date_start);
      const y = interpolateYAtX(trailPoints, x);

      // Get the approximate value at this point
      const closestPoint = trailPoints.reduce((closest, point) =>
        Math.abs(point.x - x) < Math.abs(closest.x - x) ? point : closest
      );

      return {
        event,
        x,
        y,
        value: closestPoint.value,
      };
    });
  }, [data, trailPoints, getPosition]);

  // Generate time axis ticks
  const ticks = useMemo((): Tick[] => {
    if (years.length === 0) return [];

    // If super zoomed out, show decades only
    if (pixelsPerYear < 10) {
      return years
        .filter(y => y % 10 === 0)
        .map(y => ({
          year: y,
          label: y.toString(),
          major: true
        }));
    }

    // Otherwise show years, with decades as major
    return years.map(y => ({
      year: y,
      label: y.toString(),
      major: y % 10 === 0
    }));
  }, [years, pixelsPerYear]);

  // Generate SVG path for the trail
  const trailPath = useMemo((): string => {
    if (trailPoints.length < 2) return '';

    // Use smooth bezier curves for a natural trail feel
    const points = trailPoints;
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Simple quadratic bezier for smoothness
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`;
    }

    // Final segment
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;

    return path;
  }, [trailPoints]);

  // Generate SVG path for the filled area under the trail
  const areaPath = useMemo((): string => {
    if (trailPoints.length < 2) return '';

    const baseY = TRAIL_PROFILE_CONFIG.trailHeight + TRAIL_PROFILE_CONFIG.trailPadding;
    const points = trailPoints;

    // Start from bottom-left
    let path = `M ${points[0].x} ${baseY}`;

    // Line up to first point
    path += ` L ${points[0].x} ${points[0].y}`;

    // Follow the trail curve
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`;
    }

    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;

    // Close the path along the bottom
    path += ` L ${last.x} ${baseY}`;
    path += ' Z';

    return path;
  }, [trailPoints]);

  // Get year position for ticks
  const getYearPosition = useCallback((year: number): number => {
    const yearsFromMin = year - minDate.year;
    return yearsFromMin * pixelsPerYear;
  }, [minDate.year, pixelsPerYear]);

  // Handle zoom changes
  const handleZoomChange = useCallback((value: number) => {
    setPixelsPerYear(value);
  }, []);

  // Get info at cursor position
  const getCursorInfo = useCallback((x: number): { year: number; value: number; y: number } | null => {
    if (trailPoints.length === 0) return null;

    const y = interpolateYAtX(trailPoints, x);
    const closestPoint = trailPoints.reduce((closest, point) =>
      Math.abs(point.x - x) < Math.abs(closest.x - x) ? point : closest
    );

    return {
      year: closestPoint.year,
      value: closestPoint.value,
      y,
    };
  }, [trailPoints]);

  // Get nearby events for a given x position
  const getEventsNearX = useCallback((x: number, radiusPixels: number = 50): TrailEventMarker[] => {
    return eventMarkers.filter(marker => Math.abs(marker.x - x) <= radiusPixels);
  }, [eventMarkers]);

  return {
    // State
    data,
    trailPoints,
    eventMarkers,
    trailPath,
    areaPath,
    ticks,
    pixelsPerYear,
    totalWidth,
    metricType,
    hoveredEventId,
    cursorX,

    // Handlers
    handleZoomChange,
    selectEvent,
    setHoveredEventId,
    setCursorX,
    setMetricType,
    getYearPosition,
    getCursorInfo,
    getEventsNearX,

    // Config
    trailHeight: TRAIL_PROFILE_CONFIG.trailHeight,
    trailPadding: TRAIL_PROFILE_CONFIG.trailPadding,
    axisHeight: TRAIL_PROFILE_CONFIG.axisHeight,
    markerRadius: TRAIL_PROFILE_CONFIG.markerRadius,
    markerRadiusHover: TRAIL_PROFILE_CONFIG.markerRadiusHover,
    zoomMin: TRAIL_PROFILE_CONFIG.zoomMin,
    zoomMax: TRAIL_PROFILE_CONFIG.zoomMax,
    zoomStep: TRAIL_PROFILE_CONFIG.zoomStep,
    metricLabels: METRIC_LABELS,
  };
};
