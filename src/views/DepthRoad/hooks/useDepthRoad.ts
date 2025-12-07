import { useMemo, useState, useCallback } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { parseISOExtended, fromYear, eachYearOfInterval } from '../../../utils/dateUtils';
import { DEPTH_ROAD_CONFIG, CATEGORY_COLORS } from './constants';
import type { TimelineEvent } from '../../../types/timeline';

export interface DepthRoadEvent extends TimelineEvent {
  /** Normalized depth: 0 = present (near), 1 = oldest (far) */
  normalizedDepth: number;
  /** Visual scale based on depth (smaller = farther) */
  scale: number;
  /** X position on road (-1 to 1, where 0 is center) */
  lateralPosition: number;
  /** Color based on category */
  categoryColor: string;
  /** Y position on screen (pixels from top) */
  screenY: number;
  /** X position on screen (pixels from center) */
  screenX: number;
  /** Z-index for layering (farther = lower) */
  zIndex: number;
}

export interface RoadTick {
  year: number;
  label: string;
  major: boolean;
  normalizedDepth: number;
  screenY: number;
  scale: number;
}

export interface UseDepthRoadResult {
  events: DepthRoadEvent[];
  ticks: RoadTick[];
  minYear: number;
  maxYear: number;
  totalYears: number;
  perspective: number;
  cameraTilt: number;
  handlePerspectiveChange: (value: number) => void;
  handleTiltChange: (value: number) => void;
  selectEvent: (id: string | null) => void;
  data: ReturnType<typeof useTimeline>['data'];
  // Derived geometry for the road surface
  roadGeometry: {
    widthNear: number;
    widthFar: number;
    height: number;
    vanishingY: number;
  };
}

/**
 * Maps a normalized depth (0-1) to a screen Y position.
 * Uses a power curve to create perspective foreshortening.
 *
 * depth=0 (present) → bottom of road (roadHeight)
 * depth=1 (past) → top of road (vanishingPointY)
 */
const depthToScreenY = (
  normalizedDepth: number,
  roadHeight: number,
  vanishingY: number,
  power: number
): number => {
  // Apply power curve for non-linear foreshortening
  const curvedDepth = Math.pow(normalizedDepth, power);
  // Map to screen coordinates
  const roadSpan = roadHeight - vanishingY;
  return roadHeight - curvedDepth * roadSpan;
};

/**
 * Calculates the visual scale based on depth.
 * Objects farther away appear smaller.
 */
const depthToScale = (
  normalizedDepth: number,
  minScale: number,
  maxScale: number,
  power: number
): number => {
  const curvedDepth = Math.pow(normalizedDepth, power);
  return maxScale - curvedDepth * (maxScale - minScale);
};

/**
 * Assigns a lateral position (-1 to 1) based on event category/type.
 * Spreads events across the road width to reduce visual clustering.
 */
const getLateralPosition = (event: TimelineEvent, index: number): number => {
  const spread = DEPTH_ROAD_CONFIG.eventLateralSpread;

  // Use type for primary grouping
  const typeHash = event.type.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const basePosition = ((typeHash % 100) / 100) * 2 - 1; // -1 to 1

  // Add slight offset based on index to prevent exact overlaps
  const indexOffset = ((index % 5) - 2) * 0.1;

  return Math.max(-1, Math.min(1, (basePosition + indexOffset) * spread));
};

/**
 * Gets color for event category.
 */
const getCategoryColor = (event: TimelineEvent): string => {
  return CATEGORY_COLORS[event.type] || CATEGORY_COLORS['default'];
};

export const useDepthRoad = (): UseDepthRoadResult => {
  const { data, selectEvent } = useTimeline();
  const [perspective, setPerspective] = useState<number>(DEPTH_ROAD_CONFIG.defaultPerspective);
  const [cameraTilt, setCameraTilt] = useState<number>(DEPTH_ROAD_CONFIG.defaultTilt);

  // Calculate time boundaries
  const { minYear, maxYear, totalYears } = useMemo(() => {
    if (!data || data.events.length === 0) {
      return { minYear: 2000, maxYear: 2025, totalYears: 25 };
    }

    const years = data.events.map(e => parseISOExtended(e.date_start).year);
    const min = Math.min(...years);
    const max = Math.max(...years);

    return {
      minYear: min,
      maxYear: max,
      totalYears: max - min || 1,
    };
  }, [data]);

  // Map events to depth coordinates
  const events = useMemo((): DepthRoadEvent[] => {
    if (!data) return [];

    const { roadHeight, vanishingPointY, depthCurvePower, cardMinScale, cardMaxScale } = DEPTH_ROAD_CONFIG;

    return data.events
      .map((event, index) => {
        const parsed = parseISOExtended(event.date_start);

        // Normalize: 0 = maxYear (present/recent), 1 = minYear (oldest)
        const normalizedDepth = totalYears > 0
          ? (maxYear - parsed.year) / totalYears
          : 0;

        const scale = depthToScale(normalizedDepth, cardMinScale, cardMaxScale, depthCurvePower);
        const screenY = depthToScreenY(normalizedDepth, roadHeight, vanishingPointY, depthCurvePower);
        const lateralPosition = getLateralPosition(event, index);

        // Calculate screen X based on road width at this depth
        const widthAtDepth = DEPTH_ROAD_CONFIG.roadWidthNear -
          (DEPTH_ROAD_CONFIG.roadWidthNear - DEPTH_ROAD_CONFIG.roadWidthFar) *
          Math.pow(normalizedDepth, depthCurvePower);
        const screenX = lateralPosition * (widthAtDepth / 2);

        // Z-index: closer events (lower depth) get higher z-index
        const zIndex = Math.round((1 - normalizedDepth) * 1000);

        return {
          ...event,
          normalizedDepth,
          scale,
          lateralPosition,
          categoryColor: getCategoryColor(event),
          screenY,
          screenX,
          zIndex,
        };
      })
      // Sort by depth (farthest first) for proper rendering order
      .sort((a, b) => b.normalizedDepth - a.normalizedDepth);
  }, [data, maxYear, totalYears]);

  // Generate time ticks on the road
  const ticks = useMemo((): RoadTick[] => {
    if (!data || totalYears === 0) return [];

    const { roadHeight, vanishingPointY, depthCurvePower, cardMinScale, cardMaxScale, majorTickInterval, minorTickInterval } = DEPTH_ROAD_CONFIG;

    const paddedMinYear = minYear - 5;
    const paddedMaxYear = maxYear + 5;
    const years = eachYearOfInterval(fromYear(paddedMinYear), fromYear(paddedMaxYear));

    // Determine tick interval based on total span
    const useInterval = totalYears > 100 ? majorTickInterval * 5 : // centuries for very long spans
                        totalYears > 50 ? majorTickInterval * 2 :
                        majorTickInterval;

    return years
      .filter(year => year % minorTickInterval === 0)
      .map(year => {
        const normalizedDepth = totalYears > 0
          ? Math.max(0, Math.min(1, (maxYear - year) / totalYears))
          : 0;

        const screenY = depthToScreenY(normalizedDepth, roadHeight, vanishingPointY, depthCurvePower);
        const scale = depthToScale(normalizedDepth, cardMinScale, cardMaxScale, depthCurvePower);

        return {
          year,
          label: year < 0 ? `${Math.abs(year)} BCE` : year.toString(),
          major: year % useInterval === 0,
          normalizedDepth,
          screenY,
          scale,
        };
      })
      .filter(tick => tick.normalizedDepth >= -0.1 && tick.normalizedDepth <= 1.1);
  }, [data, minYear, maxYear, totalYears]);

  const handlePerspectiveChange = useCallback((value: number) => {
    setPerspective(Math.max(DEPTH_ROAD_CONFIG.minPerspective,
      Math.min(DEPTH_ROAD_CONFIG.maxPerspective, value)));
  }, []);

  const handleTiltChange = useCallback((value: number) => {
    setCameraTilt(Math.max(DEPTH_ROAD_CONFIG.minTilt,
      Math.min(DEPTH_ROAD_CONFIG.maxTilt, value)));
  }, []);

  const roadGeometry = useMemo(() => ({
    widthNear: DEPTH_ROAD_CONFIG.roadWidthNear,
    widthFar: DEPTH_ROAD_CONFIG.roadWidthFar,
    height: DEPTH_ROAD_CONFIG.roadHeight,
    vanishingY: DEPTH_ROAD_CONFIG.vanishingPointY,
  }), []);

  return {
    events,
    ticks,
    minYear,
    maxYear,
    totalYears,
    perspective,
    cameraTilt,
    handlePerspectiveChange,
    handleTiltChange,
    selectEvent,
    data,
    roadGeometry,
  };
};
