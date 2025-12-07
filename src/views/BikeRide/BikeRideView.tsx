import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useBikeRideView } from './hooks/useBikeRideView';
import { RidePath } from './components/RidePath/RidePath';
import { EventStop } from './components/EventStop/EventStop';
import { BikeIcon } from './components/BikeIcon/BikeIcon';
import { ViewportNavigator, type NavigatorMarker } from '../../components/ViewportNavigator';
import { PlaybackControls } from '../../components/PlaybackControls';
import { ZoomControls } from '../../components/ZoomControls';
import { BIKE_RIDE_CONFIG } from './hooks/constants';
import styles from './BikeRideView.module.css';

/**
 * BikeRide Timeline View
 *
 * Represents time as a kid's bike ride along a meandering path.
 * Events appear as stops along the journey, with a bike icon
 * serving as the playhead that can be scrubbed or animated.
 *
 * Key features:
 * - Meandering path that encodes time (distance = time elapsed)
 * - Bike playhead that moves along the path
 * - Event stops with labels positioned along the path
 * - Time scrubber for navigation and playback
 * - Minimap overview for orientation
 * - Zoom controls for detail exploration
 */
export function BikeRideView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  const {
    events,
    path,
    totalWidth,
    canvasHeight,
    pixelsPerYear,
    zoomIn,
    zoomOut,
    resetZoom,
    currentTime,
    setCurrentTime,
    bikePosition,
    isPlaying,
    togglePlayback,
    playbackSpeed,
    setPlaybackSpeed,
    minYear,
    maxYear,
    getCurrentYear,
    selectedEventId,
    selectEvent,
    hoveredEventId,
    setHoveredEventId,
    viewportOffset,
    setViewportOffset,
  } = useBikeRideView();

  // Track viewport dimensions
  useEffect(() => {
    const updateViewportWidth = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
      }
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  // Sync scroll position with bike position during playback
  useEffect(() => {
    if (isPlaying && canvasRef.current && containerRef.current) {
      const container = containerRef.current;
      const targetScroll = bikePosition.x - container.clientWidth / 2;
      container.scrollLeft = Math.max(0, Math.min(totalWidth - container.clientWidth, targetScroll));
    }
  }, [isPlaying, bikePosition.x, totalWidth]);

  // Handle scroll to update viewport offset
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setViewportOffset(containerRef.current.scrollLeft);
    }
  }, [setViewportOffset]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      }
    },
    [zoomIn, zoomOut]
  );

  // Handle minimap viewport change
  const handleViewportChange = useCallback(
    (offset: number) => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = offset;
      }
    },
    []
  );

  // Generate decorative elements (trees, benches)
  const decorations = generateDecorations(path, totalWidth);

  // Convert events to NavigatorMarker format for ViewportNavigator
  const navigatorMarkers: NavigatorMarker[] = useMemo(
    () =>
      events.map((event) => ({
        id: event.event.id,
        position: event.t,
        title: event.event.title,
      })),
    [events]
  );

  return (
    <div className={styles.bikeRideView}>
      {/* Viewport navigator (minimap) */}
      <ViewportNavigator
        markers={navigatorMarkers}
        totalWidth={totalWidth}
        viewportWidth={viewportWidth}
        viewportOffset={viewportOffset}
        currentTime={currentTime}
        onViewportChange={handleViewportChange}
        onTimeChange={setCurrentTime}
        showPathPreview
      />

      {/* Zoom controls */}
      <ZoomControls
        zoomLevel={pixelsPerYear}
        minZoom={BIKE_RIDE_CONFIG.zoomMin}
        maxZoom={BIKE_RIDE_CONFIG.zoomMax}
        defaultZoom={BIKE_RIDE_CONFIG.pixelsPerYear}
        zoomStep={BIKE_RIDE_CONFIG.zoomStep}
        onZoomChange={(zoom) => {
          // Use the zoom functions to ensure proper clamping
          if (zoom > pixelsPerYear) zoomIn();
          else if (zoom < pixelsPerYear) zoomOut();
          else resetZoom();
        }}
        unit="px/yr"
        className={styles.zoomControls}
      />

      {/* Main canvas container */}
      <div
        ref={containerRef}
        className={styles.canvasContainer}
        onScroll={handleScroll}
        onWheel={handleWheel}
      >
        <div
          ref={canvasRef}
          className={styles.canvas}
          style={{
            width: totalWidth,
            height: canvasHeight,
          }}
        >
          {/* Background gradient */}
          <div className={styles.background} />

          {/* SVG layer for path and markers */}
          <svg
            className={styles.svgLayer}
            width={totalWidth}
            height={canvasHeight}
            viewBox={`0 0 ${totalWidth} ${canvasHeight}`}
          >
            {/* Decorative elements */}
            <g className={styles.decorations}>
              {decorations.map((dec, i) => (
                <g key={i} transform={`translate(${dec.x}, ${dec.y})`}>
                  {dec.type === 'tree' && <TreeDecoration />}
                  {dec.type === 'bench' && <BenchDecoration />}
                  {dec.type === 'lamp' && <LampDecoration />}
                </g>
              ))}
            </g>

            {/* The bike path */}
            <RidePath path={path} currentTime={currentTime} />

            {/* Event stops */}
            {events.map((event) => (
              <EventStop
                key={event.event.id}
                event={event}
                isSelected={selectedEventId === event.event.id}
                isHovered={hoveredEventId === event.event.id}
                isPast={event.t <= currentTime}
                onSelect={selectEvent}
                onHover={setHoveredEventId}
              />
            ))}

            {/* Bike playhead */}
            <BikeIcon
              x={bikePosition.x}
              y={bikePosition.y}
              isMoving={isPlaying}
            />
          </svg>

          {/* Year markers along bottom */}
          <div className={styles.yearMarkers}>
            {generateYearMarkers(minYear, maxYear, totalWidth, pixelsPerYear).map((marker) => (
              <div
                key={marker.year}
                className={styles.yearMarker}
                style={{ left: marker.x }}
              >
                <span className={styles.yearMarkerLabel}>
                  {formatYear(marker.year)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <PlaybackControls
        currentTime={currentTime}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        startLabel={formatYear(minYear)}
        endLabel={formatYear(maxYear)}
        currentLabel={formatYear(getCurrentYear())}
        onTimeChange={setCurrentTime}
        onTogglePlayback={togglePlayback}
        onSpeedChange={setPlaybackSpeed}
      />
    </div>
  );
}

// ============================================================
// Decorative elements
// ============================================================

function TreeDecoration() {
  return (
    <g className={styles.tree}>
      {/* Trunk */}
      <rect x="-3" y="0" width="6" height="20" fill="var(--color-border)" rx="2" />
      {/* Foliage */}
      <circle cx="0" cy="-10" r="15" fill="var(--color-bg-surface)" opacity="0.6" />
      <circle cx="-8" cy="-5" r="10" fill="var(--color-bg-surface)" opacity="0.5" />
      <circle cx="8" cy="-5" r="10" fill="var(--color-bg-surface)" opacity="0.5" />
    </g>
  );
}

function BenchDecoration() {
  return (
    <g className={styles.bench}>
      {/* Seat */}
      <rect x="-15" y="-5" width="30" height="6" fill="var(--color-border)" rx="2" />
      {/* Legs */}
      <rect x="-12" y="1" width="4" height="12" fill="var(--color-border)" rx="1" />
      <rect x="8" y="1" width="4" height="12" fill="var(--color-border)" rx="1" />
      {/* Back */}
      <rect x="-15" y="-15" width="30" height="4" fill="var(--color-border)" rx="2" />
    </g>
  );
}

function LampDecoration() {
  return (
    <g className={styles.lamp}>
      {/* Pole */}
      <rect x="-2" y="-30" width="4" height="40" fill="var(--color-border)" rx="1" />
      {/* Light */}
      <circle cx="0" cy="-35" r="8" fill="var(--color-text-secondary)" opacity="0.3" />
      <circle cx="0" cy="-35" r="4" fill="var(--color-text-accent)" opacity="0.5" />
    </g>
  );
}

// ============================================================
// Helper functions
// ============================================================

interface Decoration {
  x: number;
  y: number;
  type: 'tree' | 'bench' | 'lamp';
}

function generateDecorations(
  path: { getPointAtTime: (t: number) => { x: number; y: number } },
  totalWidth: number
): Decoration[] {
  const decorations: Decoration[] = [];
  const spacing = 300; // Pixels between decorations
  const count = Math.floor(totalWidth / spacing);

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const point = path.getPointAtTime(t);

    // Alternate above/below path
    const offset = (i % 2 === 0 ? -1 : 1) * BIKE_RIDE_CONFIG.decorationOffset;

    // Alternate decoration types
    const types: Array<'tree' | 'bench' | 'lamp'> = ['tree', 'bench', 'lamp'];
    const type = types[i % types.length];

    decorations.push({
      x: point.x,
      y: point.y + offset,
      type,
    });
  }

  return decorations;
}

interface YearMarker {
  year: number;
  x: number;
}

function generateYearMarkers(
  minYear: number,
  maxYear: number,
  totalWidth: number,
  pixelsPerYear: number
): YearMarker[] {
  const markers: YearMarker[] = [];
  const totalYears = maxYear - minYear;

  // Determine tick interval based on zoom level
  let interval = 1;
  if (pixelsPerYear < 5) interval = 1000;
  else if (pixelsPerYear < 10) interval = 500;
  else if (pixelsPerYear < 20) interval = 100;
  else if (pixelsPerYear < 50) interval = 50;
  else if (pixelsPerYear < 100) interval = 10;
  else interval = 5;

  // Round start year to interval
  const startYear = Math.ceil(minYear / interval) * interval;

  for (let year = startYear; year <= maxYear; year += interval) {
    const t = (year - minYear) / totalYears;
    markers.push({
      year,
      x: t * totalWidth,
    });
  }

  return markers;
}

function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }
  return `${year}`;
}
