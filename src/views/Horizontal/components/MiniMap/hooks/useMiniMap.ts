import { useState, useCallback, useEffect, useRef } from 'react';
import {
  recenterMinimapAroundViewport,
  getViewportIndicatorBounds,
  panMinimapRange,
  zoomMinimapRange,
  minimapPercentToYear,
} from '../utils/minimapCalculations';

interface UseMiniMapOptions {
  totalMinYear: number;
  totalMaxYear: number;
  viewportOffset: number;
  viewportWidth: number;
  pixelsPerYear: number;
}

interface UseMiniMapReturn {
  // Current minimap range (what years are visible in the minimap)
  minimapRangeStart: number;
  minimapRangeEnd: number;
  minimapYearsVisible: number;

  // Viewport indicator position within minimap
  indicatorLeftPercent: number;
  indicatorWidthPercent: number;
  isIndicatorClipped: boolean;

  // Whether minimap is at full range (showing entire timeline)
  isAtFullRange: boolean;

  // Whether there's more content in each direction
  hasMoreLeft: boolean;
  hasMoreRight: boolean;

  // Actions
  panMinimap: (deltaYears: number) => void;
  zoomMinimap: (focalYear: number, zoomFactor: number) => void;
  panMinimapByPercent: (deltaPercent: number) => void;
  zoomMinimapAtPercent: (percent: number, zoomFactor: number) => void;
  recenterOnViewport: () => void;
  resetToFullRange: () => void;

  // Drag state management
  isDraggingMinimap: boolean;
  setIsDraggingMinimap: (dragging: boolean) => void;
}

export function useMiniMap({
  totalMinYear,
  totalMaxYear,
  viewportOffset,
  viewportWidth,
  pixelsPerYear,
}: UseMiniMapOptions): UseMiniMapReturn {
  const totalYears = totalMaxYear - totalMinYear;

  // Initialize to full range
  const [minimapRangeStart, setMinimapRangeStart] = useState(totalMinYear);
  const [minimapRangeEnd, setMinimapRangeEnd] = useState(totalMaxYear);
  const [isDraggingMinimap, setIsDraggingMinimap] = useState(false);

  // Track if we've initialized
  const hasInitializedRef = useRef(false);

  // Initialize range when total bounds become available
  useEffect(() => {
    if (!hasInitializedRef.current && totalYears > 0) {
      hasInitializedRef.current = true;
      setMinimapRangeStart(totalMinYear);
      setMinimapRangeEnd(totalMaxYear);
    }
  }, [totalMinYear, totalMaxYear, totalYears]);

  // Calculate viewport indicator bounds
  const indicatorBounds = getViewportIndicatorBounds(
    viewportOffset,
    viewportWidth,
    pixelsPerYear,
    totalMinYear,
    minimapRangeStart,
    minimapRangeEnd
  );

  const minimapYearsVisible = minimapRangeEnd - minimapRangeStart;
  const isAtFullRange = minimapRangeStart <= totalMinYear && minimapRangeEnd >= totalMaxYear;
  const hasMoreLeft = minimapRangeStart > totalMinYear;
  const hasMoreRight = minimapRangeEnd < totalMaxYear;

  // Auto-center and auto-zoom on viewport when main timeline scrolls (unless dragging minimap)
  useEffect(() => {
    if (isDraggingMinimap) return;
    if (totalYears <= 0 || viewportWidth <= 0) return;

    // Calculate main viewport in year-space
    const mainViewportStartYear = viewportOffset / pixelsPerYear + totalMinYear;
    const mainViewportYears = viewportWidth / pixelsPerYear;
    const mainViewportCenterYear = mainViewportStartYear + mainViewportYears / 2;

    // Current minimap state
    const currentRange = minimapRangeEnd - minimapRangeStart;
    const viewportRatioPercent = (mainViewportYears / currentRange) * 100;

    // Check if we need to auto-zoom the minimap
    const TARGET_PERCENT = 25;
    const MIN_PERCENT = 15;
    const MAX_PERCENT = 60;
    const MIN_YEARS = 5;

    let newRange = currentRange;
    let needsUpdate = false;

    // If viewport indicator is too small, zoom in the minimap
    if (viewportRatioPercent < MIN_PERCENT) {
      // Calculate range that makes viewport ~25%
      newRange = mainViewportYears / (TARGET_PERCENT / 100);
      newRange = Math.max(MIN_YEARS, Math.min(totalYears, newRange));
      needsUpdate = true;
    }
    // If viewport indicator is too large, zoom out the minimap (up to full range)
    else if (viewportRatioPercent > MAX_PERCENT && currentRange < totalYears) {
      newRange = mainViewportYears / (TARGET_PERCENT / 100);
      newRange = Math.max(MIN_YEARS, Math.min(totalYears, newRange));
      needsUpdate = true;
    }

    // Also check if center has moved significantly
    const minimapCenterYear = (minimapRangeStart + minimapRangeEnd) / 2;
    const centerDelta = Math.abs(mainViewportCenterYear - minimapCenterYear);
    const threshold = currentRange * 0.1; // 10% of current range

    if (centerDelta > threshold) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      // Center minimap on main viewport with the new range
      let newStart = mainViewportCenterYear - newRange / 2;
      let newEnd = mainViewportCenterYear + newRange / 2;

      // Clamp to total bounds
      if (newStart < totalMinYear) {
        newStart = totalMinYear;
        newEnd = totalMinYear + newRange;
      }
      if (newEnd > totalMaxYear) {
        newEnd = totalMaxYear;
        newStart = totalMaxYear - newRange;
      }

      setMinimapRangeStart(Math.max(totalMinYear, newStart));
      setMinimapRangeEnd(Math.min(totalMaxYear, newEnd));
    }
  }, [
    viewportOffset,
    viewportWidth,
    pixelsPerYear,
    totalMinYear,
    totalMaxYear,
    totalYears,
    isDraggingMinimap,
    minimapRangeStart,
    minimapRangeEnd,
  ]);

  // Pan minimap by a delta in years
  const panMinimap = useCallback(
    (deltaYears: number) => {
      const { rangeStart, rangeEnd } = panMinimapRange(
        minimapRangeStart,
        minimapRangeEnd,
        deltaYears,
        totalMinYear,
        totalMaxYear
      );
      setMinimapRangeStart(rangeStart);
      setMinimapRangeEnd(rangeEnd);
    },
    [minimapRangeStart, minimapRangeEnd, totalMinYear, totalMaxYear]
  );

  // Pan minimap by a percentage of track width
  const panMinimapByPercent = useCallback(
    (deltaPercent: number) => {
      const deltaYears = (deltaPercent / 100) * minimapYearsVisible;
      panMinimap(-deltaYears); // Negative because dragging right should show earlier years
    },
    [minimapYearsVisible, panMinimap]
  );

  // Zoom minimap around a focal year
  const zoomMinimap = useCallback(
    (focalYear: number, zoomFactor: number) => {
      const { rangeStart, rangeEnd } = zoomMinimapRange(
        minimapRangeStart,
        minimapRangeEnd,
        focalYear,
        zoomFactor,
        totalMinYear,
        totalMaxYear
      );
      setMinimapRangeStart(rangeStart);
      setMinimapRangeEnd(rangeEnd);
    },
    [minimapRangeStart, minimapRangeEnd, totalMinYear, totalMaxYear]
  );

  // Zoom minimap at a percentage position
  const zoomMinimapAtPercent = useCallback(
    (percent: number, zoomFactor: number) => {
      const focalYear = minimapPercentToYear(percent, minimapRangeStart, minimapRangeEnd);
      zoomMinimap(focalYear, zoomFactor);
    },
    [minimapRangeStart, minimapRangeEnd, zoomMinimap]
  );

  // Recenter minimap to have viewport at ~25%
  const recenterOnViewport = useCallback(() => {
    const { rangeStart, rangeEnd } = recenterMinimapAroundViewport(
      viewportOffset,
      viewportWidth,
      pixelsPerYear,
      totalMinYear,
      totalMaxYear
    );
    setMinimapRangeStart(rangeStart);
    setMinimapRangeEnd(rangeEnd);
  }, [viewportOffset, viewportWidth, pixelsPerYear, totalMinYear, totalMaxYear]);

  // Reset to show full timeline
  const resetToFullRange = useCallback(() => {
    setMinimapRangeStart(totalMinYear);
    setMinimapRangeEnd(totalMaxYear);
  }, [totalMinYear, totalMaxYear]);

  return {
    minimapRangeStart,
    minimapRangeEnd,
    minimapYearsVisible,

    indicatorLeftPercent: indicatorBounds.visibleLeftPercent,
    indicatorWidthPercent: indicatorBounds.visibleWidthPercent,
    isIndicatorClipped: indicatorBounds.isClipped,

    isAtFullRange,
    hasMoreLeft,
    hasMoreRight,

    panMinimap,
    zoomMinimap,
    panMinimapByPercent,
    zoomMinimapAtPercent,
    recenterOnViewport,
    resetToFullRange,

    isDraggingMinimap,
    setIsDraggingMinimap,
  };
}
