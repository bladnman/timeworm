import { useMemo, useState, useCallback, useLayoutEffect, useRef, useEffect } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale, getDataBounds } from '../../../hooks/useTimeScale';
import { useUrlState } from '../../../hooks/useUrlState';
import { useTrackLayout } from './useTrackLayout';
import { useResizeFlip } from './useResizeFlip';
import { HORIZONTAL_VIEW_CONFIG } from './constants';
import { computeAutoFitZoom, getDataAwareZoomMax } from '../../../hooks/utils/autoFitZoom';
import { getMonthStartDecimalYear, getDecimalYear } from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';

export interface Tick {
  year: number;
  label: string;
  major: boolean;
}

const VIEWPORT_PADDING = 100;

// Pending scroll position - set by resize, executed after DOM update
interface PendingScroll {
  offset: number;
  triggerFlip?: boolean;
}

export const useHorizontalView = () => {
  const { data, selectEvent, selectedEventId } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(HORIZONTAL_VIEW_CONFIG.defaultPixelsPerYear);
  const [spotlightEvents, setSpotlightEvents] = useState<TimelineEvent[] | null>(null);
  const [viewportOffset, setViewportOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const hasAutoFitRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<PendingScroll | null>(null);
  // Track when we're doing a programmatic scroll to prevent the scroll listener
  // from overwriting viewportOffset with intermediate values during resize
  const isProgrammaticScrollRef = useRef(false);

  // FLIP animation for smooth resize/zoom transitions
  const { capturePositions, applyFlipTransforms } = useResizeFlip({
    containerRef,
    itemSelector: '[data-item-id]',
  });

  // URL state for share functionality
  const { initialRange, generateShareUrl, clearRangeParams } = useUrlState();

  // Get raw data bounds for auto-fit calculation
  const dataBounds = useMemo(() => getDataBounds(data), [data]);

  // Compute dynamic zoomMax based on data granularity (uses minimum event spacing)
  const zoomMax = useMemo(() => {
    if (!dataBounds) return HORIZONTAL_VIEW_CONFIG.zoomMax;
    return getDataAwareZoomMax(
      dataBounds.spanYears,
      dataBounds.eventCount,
      HORIZONTAL_VIEW_CONFIG.cardWidth,
      HORIZONTAL_VIEW_CONFIG.gap,
      dataBounds.eventYears
    );
  }, [dataBounds]);

  // Compute auto-fit parameters based on data density
  const autoFitResult = useMemo(() => {
    if (!dataBounds) return null;
    // Pass full viewport width - autoFitZoom handles edge padding internally
    const vw = window.innerWidth;

    return computeAutoFitZoom(
      dataBounds.eventCount,
      dataBounds.spanYears,
      vw,
      {
        cardWidth: HORIZONTAL_VIEW_CONFIG.cardWidth,
        gap: HORIZONTAL_VIEW_CONFIG.gap,
        stackCapacity: HORIZONTAL_VIEW_CONFIG.stackCapacity,
        zoomMin: HORIZONTAL_VIEW_CONFIG.zoomMin,
        zoomMax,
        minEdgePadding: VIEWPORT_PADDING,
      }
    );
  }, [dataBounds, zoomMax]);

  // Pass dynamic padding to useTimeScale
  const timeScaleConfig = useMemo(() => ({
    pixelsPerYear,
    paddingBefore: autoFitResult?.paddingBefore,
    paddingAfter: autoFitResult?.paddingAfter,
  }), [pixelsPerYear, autoFitResult?.paddingBefore, autoFitResult?.paddingAfter]);

  const { totalWidth, getPosition, minDate, maxDate, totalYears, years } = useTimeScale(data, timeScaleConfig);

  // Auto-fit zoom on initial load, or restore from URL if range params present
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && data && autoFitResult && totalYears > 0) {
      hasAutoFitRef.current = true;
      const vw = window.innerWidth - VIEWPORT_PADDING * 2;

      // Check if URL has range params to restore
      if (initialRange.start !== null && initialRange.end !== null) {
        // Calculate zoom and offset from normalized range
        const rangeNormalized = initialRange.end - initialRange.start;
        const rangeYears = rangeNormalized * totalYears;

        // Calculate pixelsPerYear to fit the range in viewport
        const newPPY = Math.max(
          HORIZONTAL_VIEW_CONFIG.zoomMin,
          Math.min(zoomMax, vw / rangeYears)
        );

        // Calculate offset: start position in pixels
        const startYearsFromMin = initialRange.start * totalYears;
        const newOffset = startYearsFromMin * newPPY;

        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
        setPixelsPerYear(newPPY);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
        setViewportOffset(newOffset);

        // Clear range params from URL after restoring (keeps URL clean)
        clearRangeParams();

        // Scroll container to restored position
        if (containerRef.current) {
          containerRef.current.scrollTo({ left: newOffset, behavior: 'auto' });
        }
      } else {
        // No URL range, use smart auto-fit based on data density
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
        setPixelsPerYear(autoFitResult.pixelsPerYear);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
        setViewportOffset(autoFitResult.initialOffset);
      }
    }
  }, [data, totalYears, initialRange, clearRangeParams, autoFitResult]);

  // Execute pending scroll after DOM updates with new totalWidth
  // This ensures scrollTo works correctly when zooming in (where new offset > old container width)
  useLayoutEffect(() => {
    if (pendingScrollRef.current && containerRef.current) {
      const { offset, triggerFlip } = pendingScrollRef.current;
      const container = containerRef.current;
      pendingScrollRef.current = null;

      // Now the DOM has the new totalWidth, so scrollTo won't be clamped incorrectly
      container.scrollTo({
        left: offset,
        behavior: 'auto',
      });

      // FLIP: Apply transforms BEFORE paint (synchronously in useLayoutEffect)
      // This prevents the flash of items at their final positions
      if (triggerFlip) {
        applyFlipTransforms();
      }

      // Clear the programmatic scroll flag and restore smooth scrolling after the scroll settles
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
        // Restore smooth scrolling and transitions for normal user interactions
        container.style.scrollBehavior = '';
        delete container.dataset.resizing;
      });
    }
  }, [pixelsPerYear, applyFlipTransforms]); // Run after pixelsPerYear changes trigger a re-render

  // Get track layout with clustering
  const { items, maxStackAbove, maxStackBelow } = useTrackLayout(data, {
    cardWidth: HORIZONTAL_VIEW_CONFIG.cardWidth,
    gap: HORIZONTAL_VIEW_CONFIG.gap,
    clusterThreshold: HORIZONTAL_VIEW_CONFIG.clusterThreshold,
    getPosition,
  });

  // Generate ticks for the axis - adaptive based on zoom level
  // Uses shared getDecimalYear/getMonthStartDecimalYear from dateUtils for consistency with event positioning
  const ticks = useMemo((): Tick[] => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startYear = Math.floor(minDate.decimalYear);
    const endYear = Math.ceil(maxDate.decimalYear);

    // DAY-LEVEL: > 3000 px/yr (~8px per day) - show days
    if (pixelsPerYear > 3000) {
      const dayTicks: Tick[] = [];
      for (let y = startYear; y <= endYear; y++) {
        for (let m = 0; m < 12; m++) {
          const daysInMonth = new Date(y, m + 1, 0).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
            // getDecimalYear uses 1-indexed month, so m+1
            const decimalYear = getDecimalYear(y, m + 1, d);
            if (decimalYear >= minDate.decimalYear - 0.01 && decimalYear <= maxDate.decimalYear + 0.01) {
              const isFirstOfMonth = d === 1;
              const isFirstOfYear = m === 0 && d === 1;
              dayTicks.push({
                year: decimalYear,
                label: isFirstOfYear ? `${y}` : isFirstOfMonth ? MONTHS[m] : `${d}`,
                major: isFirstOfMonth,
              });
            }
          }
        }
      }
      return dayTicks;
    }

    // MONTH-LEVEL: 100-3000 px/yr - show months
    if (pixelsPerYear > 100) {
      const monthTicks: Tick[] = [];
      for (let y = startYear; y <= endYear; y++) {
        for (let m = 0; m < 12; m++) {
          // getMonthStartDecimalYear takes 0-indexed month
          const decimalYear = getMonthStartDecimalYear(y, m);
          if (decimalYear >= minDate.decimalYear - 0.1 && decimalYear <= maxDate.decimalYear + 0.1) {
            monthTicks.push({
              year: decimalYear,
              label: m === 0 ? `${y}` : MONTHS[m],
              major: m === 0 || m === 6,
            });
          }
        }
      }
      return monthTicks;
    }

    // YEAR-LEVEL: use the years array from useTimeScale
    if (years.length === 0) return [];

    // < 10 px/yr → decades only
    if (pixelsPerYear < 10) {
      return years
        .filter((y) => y % 10 === 0)
        .map((y) => ({ year: y, label: y.toString(), major: true }));
    }

    // 10-100 px/yr → years (mark all as major if few years)
    const allMajor = years.length < 10;
    return years.map((y) => ({
      year: y,
      label: y.toString(),
      major: allMajor || y % 10 === 0,
    }));
  }, [years, pixelsPerYear, minDate.decimalYear, maxDate.decimalYear]);

  // Handlers
  const handleZoomChange = useCallback((value: number) => {
    setPixelsPerYear(value);
  }, []);

  // Handle zoom delta (for minimap scroll wheel)
  const handleZoomDelta = useCallback((delta: number) => {
    setPixelsPerYear((prev) => {
      const newValue = prev + delta * HORIZONTAL_VIEW_CONFIG.zoomStep;
      return Math.max(HORIZONTAL_VIEW_CONFIG.zoomMin, Math.min(zoomMax, newValue));
    });
  }, [zoomMax]);

  // Handle resize from minimap - sets new pixels per year and anchors an edge
  // Uses frozen snapshot values from MiniMap to ensure consistent calculation
  const handleResizeZoom = useCallback((
    newPixelsPerYear: number,
    edge: 'left' | 'right',
    snapshotViewportOffset: number,
    snapshotPixelsPerYear: number
  ) => {
    // FLIP Step 1: Capture visual positions BEFORE any state changes
    capturePositions();

    const clampedPPY = Math.max(HORIZONTAL_VIEW_CONFIG.zoomMin, Math.min(zoomMax, newPixelsPerYear));

    // Calculate anchor year from the frozen snapshot values
    // For right edge drag: anchor LEFT edge (keep it at the same year)
    // For left edge drag: anchor RIGHT edge (keep it at the same year)
    const snapshotLeftYearsFromMin = snapshotViewportOffset / snapshotPixelsPerYear;
    const snapshotViewportYears = viewportWidth / snapshotPixelsPerYear;
    const snapshotRightYearsFromMin = snapshotLeftYearsFromMin + snapshotViewportYears;

    let newOffset: number;
    if (edge === 'right') {
      // Keep left edge at the same year position
      newOffset = snapshotLeftYearsFromMin * clampedPPY;
    } else {
      // Keep right edge at the same year position
      // Right edge year stays fixed, so: newRightOffset = snapshotRightYearsFromMin * clampedPPY
      // newOffset = newRightOffset - viewportWidth
      newOffset = snapshotRightYearsFromMin * clampedPPY - viewportWidth;
    }

    // Calculate new total width to clamp offset properly
    const newTotalWidth = totalYears * clampedPPY;
    const clampedOffset = Math.max(0, Math.min(newTotalWidth - viewportWidth, newOffset));

    // Store pending scroll - will be executed after DOM updates via useLayoutEffect
    // This is critical because when zooming in, the new offset may exceed the OLD
    // container width, causing scrollTo to be clamped by the browser.
    pendingScrollRef.current = { offset: clampedOffset, triggerFlip: true };
    // Prevent scroll listener from overwriting viewportOffset during the transition
    isProgrammaticScrollRef.current = true;

    // Temporarily disable smooth scrolling and CSS transitions to prevent "zoom from zero" animation
    // The browser may animate scroll position changes when content size changes
    // Also, CSS transitions on items cause them to animate from old positions
    if (containerRef.current) {
      containerRef.current.style.scrollBehavior = 'auto';
      containerRef.current.dataset.resizing = 'true';
    }

    setPixelsPerYear(clampedPPY);
    setViewportOffset(clampedOffset);
  }, [capturePositions, viewportWidth, totalYears, zoomMax]);

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

  // Get year position for ticks (uses decimal year for proper sub-year positioning)
  const getYearPosition = useCallback(
    (year: number): number => {
      const yearsFromMin = year - minDate.decimalYear;
      return yearsFromMin * pixelsPerYear;
    },
    [minDate.decimalYear, pixelsPerYear]
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
      // Skip updating viewportOffset during programmatic scrolls (e.g., resize zoom)
      // to prevent intermediate scroll positions from overwriting the intended offset
      if (!isProgrammaticScrollRef.current) {
        setViewportOffset(container.scrollLeft);
      }
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
          handleZoomChange(Math.min(zoomMax, pixelsPerYear + HORIZONTAL_VIEW_CONFIG.zoomStep * 2));
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
  }, [spotlightEvents, viewportWidth, viewportOffset, totalWidth, pixelsPerYear, handleViewportChange, handleZoomChange, zoomMax]);

  // Get current viewport range as normalized values for sharing
  const getShareState = useCallback((): { start: number; end: number } | null => {
    if (totalYears <= 0 || viewportWidth <= 0) return null;

    // Current viewport in years from timeline start
    const startYearsFromMin = viewportOffset / pixelsPerYear;
    const endYearsFromMin = (viewportOffset + viewportWidth) / pixelsPerYear;

    // Normalize to 0-1
    const start = Math.max(0, Math.min(1, startYearsFromMin / totalYears));
    const end = Math.max(0, Math.min(1, endYearsFromMin / totalYears));

    return { start, end };
  }, [viewportOffset, viewportWidth, pixelsPerYear, totalYears]);

  // Generate a shareable URL for current viewport
  const getShareUrl = useCallback((): string | null => {
    const state = getShareState();
    if (!state) return null;
    return generateShareUrl(state.start, state.end);
  }, [getShareState, generateShareUrl]);

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

    // Share
    getShareUrl,

    // Config
    config: HORIZONTAL_VIEW_CONFIG,
  };
};
