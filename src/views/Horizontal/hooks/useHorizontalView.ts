import { useMemo, useState, useCallback, useLayoutEffect, useRef, useEffect } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale } from '../../../hooks/useTimeScale';
import { useTrackLayout } from './useTrackLayout';
import { HORIZONTAL_VIEW_CONFIG } from './constants';
import type { TimelineEvent } from '../../../types/timeline';

export interface Tick {
  year: number;
  label: string;
  major: boolean;
}

const VIEWPORT_PADDING = 100;
const IDEAL_YEARS_IN_VIEW = 80; // Show ~80 years at a time for good readability

const computeAutoFitZoom = (_totalYears: number): number => {
  const viewportWidth = window.innerWidth - VIEWPORT_PADDING * 2;
  // Calculate zoom to show IDEAL_YEARS_IN_VIEW years in the viewport
  const idealZoom = viewportWidth / IDEAL_YEARS_IN_VIEW;
  return Math.max(
    HORIZONTAL_VIEW_CONFIG.zoomMin,
    Math.min(HORIZONTAL_VIEW_CONFIG.zoomMax, idealZoom)
  );
};

export const useHorizontalView = () => {
  const { data, selectEvent, selectedEventId } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(HORIZONTAL_VIEW_CONFIG.defaultPixelsPerYear);
  const [spotlightEvents, setSpotlightEvents] = useState<TimelineEvent[] | null>(null);
  const [viewportOffset, setViewportOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const hasAutoFitRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { totalWidth, getPosition, minDate, maxDate, totalYears, years } = useTimeScale(data, { pixelsPerYear });

  // Auto-fit zoom on initial load
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && data && totalYears > 0) {
      hasAutoFitRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
      setPixelsPerYear(computeAutoFitZoom(totalYears));
    }
  }, [data, totalYears]);

  // Get track layout with clustering
  const { items, maxStackAbove, maxStackBelow } = useTrackLayout(data, {
    cardWidth: HORIZONTAL_VIEW_CONFIG.cardWidth,
    gap: HORIZONTAL_VIEW_CONFIG.gap,
    clusterThreshold: HORIZONTAL_VIEW_CONFIG.clusterThreshold,
    getPosition,
  });

  // Generate ticks for the axis
  const ticks = useMemo((): Tick[] => {
    if (years.length === 0) return [];

    // If super zoomed out (< 10px/yr), show decades only
    if (pixelsPerYear < 10) {
      return years
        .filter((y) => y % 10 === 0)
        .map((y) => ({
          year: y,
          label: y.toString(),
          major: true,
        }));
    }

    // Otherwise show years, with decades as major
    return years.map((y) => ({
      year: y,
      label: y.toString(),
      major: y % 10 === 0,
    }));
  }, [years, pixelsPerYear]);

  // Handlers
  const handleZoomChange = useCallback((value: number) => {
    setPixelsPerYear(value);
  }, []);

  // Handle zoom delta (for minimap scroll wheel)
  const handleZoomDelta = useCallback((delta: number) => {
    setPixelsPerYear((prev) => {
      const newValue = prev + delta * HORIZONTAL_VIEW_CONFIG.zoomStep;
      return Math.max(HORIZONTAL_VIEW_CONFIG.zoomMin, Math.min(HORIZONTAL_VIEW_CONFIG.zoomMax, newValue));
    });
  }, []);

  // Handle resize from minimap - sets new pixels per year based on desired viewport ratio
  // anchorPercent: 0 = anchor left edge, 1 = anchor right edge
  const handleResizeZoom = useCallback((newPixelsPerYear: number, anchorPercent: number) => {
    const clampedPPY = Math.max(HORIZONTAL_VIEW_CONFIG.zoomMin, Math.min(HORIZONTAL_VIEW_CONFIG.zoomMax, newPixelsPerYear));

    // Calculate the anchor point in years (what year position should stay fixed)
    const currentAnchorOffset = viewportOffset + (viewportWidth * anchorPercent);
    const anchorYearPosition = currentAnchorOffset / pixelsPerYear;

    // After zoom, where should the viewport be to keep the anchor in the same screen position?
    const newAnchorOffset = anchorYearPosition * clampedPPY;
    const newViewportOffset = newAnchorOffset - (viewportWidth * anchorPercent);

    // Calculate new total width to clamp offset properly
    const newTotalWidth = totalYears * clampedPPY;
    const clampedOffset = Math.max(0, Math.min(newTotalWidth - viewportWidth, newViewportOffset));

    setPixelsPerYear(clampedPPY);
    setViewportOffset(clampedOffset);

    // Scroll to new position
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: clampedOffset,
        behavior: 'auto', // instant, not smooth, for resize
      });
    }
  }, [viewportOffset, viewportWidth, pixelsPerYear, totalYears]);

  const handleEventClick = useCallback((eventId: string) => {
    const event = data?.events.find((e) => e.id === eventId);
    if (event) {
      setSpotlightEvents([event]);
    }
  }, [data]);

  const handleClusterClick = useCallback((events: TimelineEvent[]) => {
    setSpotlightEvents(events);
  }, []);

  const handleSpotlightClose = useCallback(() => {
    setSpotlightEvents(null);
  }, []);

  const handleViewportChange = useCallback((offset: number) => {
    setViewportOffset(offset);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: offset,
        behavior: 'smooth',
      });
    }
  }, []);

  // Get year position for ticks
  const getYearPosition = useCallback(
    (year: number): number => {
      const yearsFromMin = year - minDate.year;
      return yearsFromMin * pixelsPerYear;
    },
    [minDate.year, pixelsPerYear]
  );

  // Calculate track height based on stack depth
  const trackContentHeight = useMemo(() => {
    const { cardHeight, connectorLength, stackOffset } = HORIZONTAL_VIEW_CONFIG;
    const aboveHeight = connectorLength + cardHeight + Math.max(0, maxStackAbove - 1) * stackOffset;
    const belowHeight = connectorLength + cardHeight + Math.max(0, maxStackBelow - 1) * stackOffset;
    return Math.max(500, aboveHeight + belowHeight + 150);
  }, [maxStackAbove, maxStackBelow]);

  // Sync viewport dimensions on scroll and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateViewport = () => {
      setViewportOffset(container.scrollLeft);
      setViewportWidth(container.clientWidth);
    };

    updateViewport();
    container.addEventListener('scroll', updateViewport, { passive: true });
    window.addEventListener('resize', updateViewport);

    return () => {
      container.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in an input or spotlight is open
      if (
        spotlightEvents ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const panAmount = viewportWidth * 0.25;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleViewportChange(Math.max(0, viewportOffset - (e.shiftKey ? panAmount * 2 : panAmount)));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleViewportChange(Math.min(totalWidth - viewportWidth, viewportOffset + (e.shiftKey ? panAmount * 2 : panAmount)));
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomChange(Math.min(HORIZONTAL_VIEW_CONFIG.zoomMax, pixelsPerYear + HORIZONTAL_VIEW_CONFIG.zoomStep * 2));
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomChange(Math.max(HORIZONTAL_VIEW_CONFIG.zoomMin, pixelsPerYear - HORIZONTAL_VIEW_CONFIG.zoomStep * 2));
          break;
        case 'Home':
          e.preventDefault();
          handleViewportChange(0);
          break;
        case 'End':
          e.preventDefault();
          handleViewportChange(totalWidth - viewportWidth);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [spotlightEvents, viewportWidth, viewportOffset, totalWidth, pixelsPerYear, handleViewportChange, handleZoomChange]);

  return {
    // Data
    data,
    items,
    ticks,
    spotlightEvents,

    // Dimensions
    pixelsPerYear,
    totalWidth,
    trackContentHeight,
    viewportOffset,
    viewportWidth,
    minYear: minDate.year,
    maxYear: maxDate.year,

    // Refs
    containerRef,

    // Handlers
    handleZoomChange,
    handleZoomDelta,
    handleResizeZoom,
    handleEventClick,
    handleClusterClick,
    handleSpotlightClose,
    handleViewportChange,
    getYearPosition,
    selectEvent,
    selectedEventId,

    // Config
    config: HORIZONTAL_VIEW_CONFIG,
  };
};
