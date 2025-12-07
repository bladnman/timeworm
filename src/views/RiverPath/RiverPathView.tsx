/**
 * River Path View - A timeline visualized as a winding river.
 *
 * Time flows like water: upstream is the past, downstream is the present.
 * Events appear as markers along the river banks, positioned accurately
 * based on their temporal distance along the meandering path.
 */

import { useRiverPath, type TimeRange, type RiverPathData } from './hooks/useRiverPath';
import { River } from './components/River/River';
import { EventMarker } from './components/EventMarker/EventMarker';
import styles from './RiverPathView.module.css';

export const RiverPathView = () => {
  const {
    data,
    events,
    riverPath,
    timeRange,
    canvasWidth,
    canvasHeight,
    scaledWidth,
    scaledHeight,
    zoom,
    hoveredEventId,
    handleZoomChange,
    handleEventHover,
    selectEvent,
    config,
  } = useRiverPath();

  if (!data || !riverPath) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Charting the river...</div>
      </div>
    );
  }

  // Determine if we should show labels based on zoom level
  const showLabels = zoom >= config.lodMinZoomForLabels;

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Journey Scale: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min={config.zoomMin}
            max={config.zoomMax}
            step={config.zoomStep}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendUpstream}>◂</span> Past
          </span>
          <span className={styles.legendDivider}>~</span>
          <span className={styles.legendItem}>
            Present <span className={styles.legendDownstream}>▸</span>
          </span>
        </div>
      </div>

      {/* River viewport */}
      <div className={styles.viewport}>
        <div
          className={styles.canvas}
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          {/* Background gradient */}
          <div className={styles.background} />

          {/* The river */}
          <svg
            className={styles.riverLayer}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            preserveAspectRatio="none"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
            }}
          >
            {/* River body */}
            <River
              riverPath={riverPath}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </svg>

          {/* Events layer */}
          <svg
            className={styles.eventsLayer}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            preserveAspectRatio="none"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
            }}
          >
            {events.map((event) => (
              <EventMarker
                key={event.id}
                event={event}
                isHovered={hoveredEventId === event.id}
                isSelected={false}
                zoom={zoom}
                showLabel={showLabels}
                onHover={handleEventHover}
                onClick={selectEvent}
              />
            ))}
          </svg>

          {/* Era markers (time labels along the river) */}
          <div className={styles.eraMarkers}>
            {generateEraMarkers(riverPath, timeRange)}
          </div>
        </div>
      </div>

      {/* Keyboard navigation hint */}
      <div className={styles.hint}>
        Scroll to navigate the river • Click events for details
      </div>
    </div>
  );
};

/**
 * Generate era markers (year labels) at significant points along the river.
 */
function generateEraMarkers(
  riverPath: RiverPathData,
  timeRange: TimeRange
) {
  if (timeRange.span === 0) return null;

  // Create markers at evenly spaced intervals
  const markerCount = 8;
  const markers = [];

  for (let i = 0; i <= markerCount; i++) {
    const t = i / markerCount;
    const arcLength = t * riverPath.arcLengthLookup.totalLength;

    // Find the sample closest to this arc length
    const sample = riverPath.arcLengthLookup.samples.find(
      (s) => s.arcLength >= arcLength
    ) || riverPath.arcLengthLookup.samples[riverPath.arcLengthLookup.samples.length - 1];

    // Calculate year label based on actual time range
    const year = Math.round(timeRange.minYear + t * timeRange.span);

    markers.push(
      <div
        key={`era-${i}`}
        className={styles.eraMarker}
        style={{
          left: `${sample.point.x}px`,
          top: `${sample.point.y + 60}px`,
        }}
      >
        <span className={styles.eraYear}>{year}</span>
      </div>
    );
  }

  return markers;
}
