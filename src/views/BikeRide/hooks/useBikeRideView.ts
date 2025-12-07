import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale } from '../../../hooks/useTimeScale';
import { usePathGenerator, type GeneratedPath } from './usePathGenerator';
import { parseISOExtended, differenceInYears } from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';
import { BIKE_RIDE_CONFIG } from './constants';

export interface BikeRideEvent {
  event: TimelineEvent;
  t: number; // Normalized time position (0-1)
  x: number; // X position on canvas
  y: number; // Y position on path
  gapYearsBefore: number | null;
  showGapIndicator: boolean;
}

export interface BikeRideViewState {
  // Data
  events: BikeRideEvent[];
  path: GeneratedPath;

  // Dimensions
  totalWidth: number;
  canvasHeight: number;

  // Zoom & pan
  pixelsPerYear: number;
  setPixelsPerYear: (ppy: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Playhead
  currentTime: number; // Normalized (0-1)
  setCurrentTime: (t: number) => void;
  bikePosition: { x: number; y: number };

  // Playback
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  // Time info
  minYear: number;
  maxYear: number;
  totalYears: number;
  getCurrentYear: () => number;

  // Selection
  selectedEventId: string | null;
  selectEvent: (id: string | null) => void;
  hoveredEventId: string | null;
  setHoveredEventId: (id: string | null) => void;

  // Viewport
  viewportOffset: number;
  setViewportOffset: (offset: number) => void;
  scrollToTime: (t: number) => void;
  scrollToEvent: (eventId: string) => void;
}

export function useBikeRideView(): BikeRideViewState {
  const { data, selectedEventId, selectEvent } = useTimeline();

  // Zoom state
  const [pixelsPerYear, setPixelsPerYear] = useState(BIKE_RIDE_CONFIG.pixelsPerYear);

  // Playhead state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Hover state
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  // Viewport offset for panning
  const [viewportOffset, setViewportOffset] = useState(0);

  // Animation frame ref
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Get time scale from events
  const timeScale = useTimeScale(data ?? null, { pixelsPerYear });

  // Calculate total width based on time scale
  const totalWidth = useMemo(() => {
    return Math.max(BIKE_RIDE_CONFIG.minCanvasWidth, timeScale.totalWidth);
  }, [timeScale.totalWidth]);

  // Generate the path
  const path = usePathGenerator(totalWidth);

  // Extract year range
  const minYear = timeScale.minDate.year;
  const maxYear = timeScale.maxDate.year;
  const totalYears = timeScale.totalYears;

  // Map events to path positions
  const events = useMemo<BikeRideEvent[]>(() => {
    if (!data?.events.length) return [];

    // Sort events by date
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    return sortedEvents.map((event, index) => {
      // Calculate normalized time position
      const eventDate = parseISOExtended(event.date_start);
      const xPos = timeScale.getPosition(event.date_start);
      const t = totalWidth > 0 ? xPos / totalWidth : 0;

      // Get path position
      const pathPoint = path.getPointAtTime(t);

      // Calculate gap from previous event
      let gapYearsBefore: number | null = null;
      let showGapIndicator = false;

      if (index > 0) {
        const prevEvent = sortedEvents[index - 1];
        const prevDate = parseISOExtended(prevEvent.date_start);
        gapYearsBefore = Math.abs(differenceInYears(eventDate, prevDate));
        showGapIndicator = gapYearsBefore >= BIKE_RIDE_CONFIG.gapThresholdYears;
      }

      return {
        event,
        t,
        x: pathPoint.x,
        y: pathPoint.y,
        gapYearsBefore,
        showGapIndicator,
      };
    });
  }, [data?.events, timeScale, totalWidth, path]);

  // Current bike position
  const bikePosition = useMemo(() => {
    return path.getPointAtTime(currentTime);
  }, [path, currentTime]);

  // Get current year from normalized time
  const getCurrentYear = useCallback(() => {
    return Math.round(minYear + currentTime * totalYears);
  }, [minYear, totalYears, currentTime]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setPixelsPerYear((prev) =>
      Math.min(prev * BIKE_RIDE_CONFIG.zoomStep, BIKE_RIDE_CONFIG.zoomMax)
    );
  }, []);

  const zoomOut = useCallback(() => {
    setPixelsPerYear((prev) =>
      Math.max(prev / BIKE_RIDE_CONFIG.zoomStep, BIKE_RIDE_CONFIG.zoomMin)
    );
  }, []);

  const resetZoom = useCallback(() => {
    setPixelsPerYear(BIKE_RIDE_CONFIG.pixelsPerYear);
  }, []);

  // Playback controls
  const play = useCallback(() => {
    setIsPlaying(true);
    lastTimeRef.current = performance.now();
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (timestamp: number) => {
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Calculate time increment
      // playbackSpeed controls how many years pass per second
      const yearsPerMs = playbackSpeed / 1000;
      const yearsElapsed = deltaMs * yearsPerMs;
      const tIncrement = yearsElapsed / totalYears;

      setCurrentTime((prev) => {
        const next = prev + tIncrement;
        if (next >= 1) {
          // Stop at end
          pause();
          return 1;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalYears, pause]);

  // Scroll to specific time
  const scrollToTime = useCallback((t: number) => {
    const clampedT = Math.max(0, Math.min(1, t));
    setCurrentTime(clampedT);
    // Viewport scrolling handled by the container
  }, []);

  // Scroll to specific event
  const scrollToEvent = useCallback((eventId: string) => {
    const event = events.find((e) => e.event.id === eventId);
    if (event) {
      setCurrentTime(event.t);
      selectEvent(eventId);
    }
  }, [events, selectEvent]);

  return {
    events,
    path,
    totalWidth,
    canvasHeight: BIKE_RIDE_CONFIG.canvasHeight,
    pixelsPerYear,
    setPixelsPerYear,
    zoomIn,
    zoomOut,
    resetZoom,
    currentTime,
    setCurrentTime,
    bikePosition,
    isPlaying,
    play,
    pause,
    togglePlayback,
    playbackSpeed,
    setPlaybackSpeed,
    minYear,
    maxYear,
    totalYears,
    getCurrentYear,
    selectedEventId,
    selectEvent,
    hoveredEventId,
    setHoveredEventId,
    viewportOffset,
    setViewportOffset,
    scrollToTime,
    scrollToEvent,
  };
}
