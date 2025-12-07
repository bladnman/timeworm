import { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { useSwimlanes } from '../../../hooks/useSwimlanes';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale } from '../../../hooks/useTimeScale';
import { HORIZONTAL_VIEW_CONFIG } from './constants';

export interface Tick {
  year: number;
  label: string;
  major: boolean;
}

const VIEWPORT_PADDING = 100; // Padding on each side when auto-fitting

const computeAutoFitZoom = (totalYears: number): number => {
  const viewportWidth = window.innerWidth - VIEWPORT_PADDING * 2;
  return Math.max(
    HORIZONTAL_VIEW_CONFIG.zoomMin,
    Math.min(HORIZONTAL_VIEW_CONFIG.zoomMax, viewportWidth / totalYears)
  );
};

export const useHorizontalView = () => {
  const { data, selectEvent } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(HORIZONTAL_VIEW_CONFIG.defaultPixelsPerYear);
  const hasAutoFitRef = useRef(false);

  const { totalWidth, getPosition, minDate, totalYears, years } = useTimeScale(data, { pixelsPerYear });

  // Auto-fit zoom on initial load using useLayoutEffect for synchronous update before paint
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && data && totalYears > 0) {
      hasAutoFitRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
      setPixelsPerYear(computeAutoFitZoom(totalYears));
    }
  }, [data, totalYears]);

  const { events, maxLane } = useSwimlanes(data, {
    cardWidth: HORIZONTAL_VIEW_CONFIG.cardWidth,
    gap: HORIZONTAL_VIEW_CONFIG.gap,
    getPosition
  });

  const ticks = useMemo((): Tick[] => {
    if (years.length === 0) return [];

    // If super zoomed out (< 10px/yr), show Decades
    if (pixelsPerYear < 10) {
      return years
        .filter(y => y % 10 === 0)
        .map(y => ({
          year: y,
          label: y.toString(),
          major: true
        }));
    }

    // Otherwise show Years, with decades as major
    return years.map(y => ({
      year: y,
      label: y.toString(),
      major: y % 10 === 0
    }));
  }, [years, pixelsPerYear]);

  const handleZoomChange = useCallback((value: number) => {
    setPixelsPerYear(value);
  }, []);

  // Get position for a year number (for tick rendering)
  const getYearPosition = useCallback((year: number): number => {
    const yearsFromMin = year - minDate.year;
    return yearsFromMin * pixelsPerYear;
  }, [minDate.year, pixelsPerYear]);

  return {
    // State
    data,
    events,
    ticks,
    pixelsPerYear,
    totalWidth,
    maxLane,
    // Handlers
    handleZoomChange,
    selectEvent,
    getPosition,
    getYearPosition,
    // Config
    cardHeight: HORIZONTAL_VIEW_CONFIG.cardHeight,
    zoomMin: HORIZONTAL_VIEW_CONFIG.zoomMin,
    zoomMax: HORIZONTAL_VIEW_CONFIG.zoomMax,
    zoomStep: HORIZONTAL_VIEW_CONFIG.zoomStep,
  };
};
