import { useState, useCallback, useLayoutEffect, useRef, useMemo } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale } from '../../../hooks/useTimeScale';
import { useStationGenerator } from './useStationGenerator';
import { useEventPositioning } from './useEventPositioning';
import { TRAIN_JOURNEY_CONFIG, type TrackSegment } from '../constants';

const VIEWPORT_PADDING = 100;

const computeAutoFitZoom = (totalYears: number): number => {
  const viewportWidth = window.innerWidth - VIEWPORT_PADDING * 2;
  return Math.max(
    TRAIN_JOURNEY_CONFIG.zoomMin,
    Math.min(TRAIN_JOURNEY_CONFIG.zoomMax, viewportWidth / totalYears)
  );
};

export const useTrainJourney = () => {
  const { data, selectEvent } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(TRAIN_JOURNEY_CONFIG.defaultPixelsPerYear);
  const hasAutoFitRef = useRef(false);

  // Get time scale calculations
  const { totalWidth, getPosition, minDate, maxDate, totalYears } = useTimeScale(data, {
    pixelsPerYear,
  });

  // Auto-fit zoom on initial load using useLayoutEffect for synchronous update before paint
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && data && totalYears > 0) {
      hasAutoFitRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time sync before paint
      setPixelsPerYear(computeAutoFitZoom(totalYears));
    }
  }, [data, totalYears]);

  // Generate stations based on time range
  const stations = useStationGenerator({
    minDate,
    maxDate,
    totalYears,
    pixelsPerYear,
  });

  // Position events along the track
  const { positionedEvents, clusters } = useEventPositioning({
    events: data?.events ?? [],
    stations,
    getPosition,
    pixelsPerYear,
  });

  // Generate track segments between stations
  const trackSegments = useMemo((): TrackSegment[] => {
    if (stations.length < 2) return [];

    const segments: TrackSegment[] = [];
    for (let i = 0; i < stations.length - 1; i++) {
      segments.push({
        startX: stations[i].xPos,
        endX: stations[i + 1].xPos,
        startYear: stations[i].year,
        endYear: stations[i + 1].year,
      });
    }
    return segments;
  }, [stations]);

  // Zoom handlers
  const handleZoomChange = useCallback((value: number) => {
    setPixelsPerYear(value);
  }, []);

  const handleZoomIn = useCallback(() => {
    setPixelsPerYear((prev) =>
      Math.min(prev + TRAIN_JOURNEY_CONFIG.zoomStep * 5, TRAIN_JOURNEY_CONFIG.zoomMax)
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    setPixelsPerYear((prev) =>
      Math.max(prev - TRAIN_JOURNEY_CONFIG.zoomStep * 5, TRAIN_JOURNEY_CONFIG.zoomMin)
    );
  }, []);

  const handleAutoFit = useCallback(() => {
    if (totalYears > 0) {
      setPixelsPerYear(computeAutoFitZoom(totalYears));
    }
  }, [totalYears]);

  // Get year position for rendering
  const getYearPosition = useCallback(
    (year: number): number => {
      const yearsFromMin = year - minDate.year;
      return yearsFromMin * pixelsPerYear;
    },
    [minDate.year, pixelsPerYear]
  );

  return {
    // Data
    data,
    stations,
    trackSegments,
    positionedEvents,
    clusters,

    // Layout
    totalWidth,
    trackY: TRAIN_JOURNEY_CONFIG.trackY,
    eventCardWidth: TRAIN_JOURNEY_CONFIG.eventCardWidth,
    eventCardHeight: TRAIN_JOURNEY_CONFIG.eventCardHeight,
    eventConnectorLength: TRAIN_JOURNEY_CONFIG.eventConnectorLength,

    // Zoom state
    pixelsPerYear,
    zoomMin: TRAIN_JOURNEY_CONFIG.zoomMin,
    zoomMax: TRAIN_JOURNEY_CONFIG.zoomMax,
    zoomStep: TRAIN_JOURNEY_CONFIG.zoomStep,

    // Handlers
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    handleAutoFit,
    selectEvent,
    getPosition,
    getYearPosition,
  };
};
